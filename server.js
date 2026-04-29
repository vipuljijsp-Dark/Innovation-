require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const multer = require("multer");
const mongoose = require("mongoose");

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads/" });

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✓ Connected to MongoDB successfully");
  console.log(`✓ Database: ${process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp"}`);
})
.catch(err => {
  console.error("✗ MongoDB connection error:", err.message);
  process.exit(1);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// Database status endpoint
app.get("/api/db-status", (req, res) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    database: process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
    message: mongoose.connection.readyState === 1 ? "Database is connected" : "Database is disconnected"
  };
  res.json(dbStatus);
});

let users = {};

const roomLabels = {
  "dark-room": "Dark Room",
  "project-discussion": "Project Discussion"
};

const sendOnlineUsers = () => {
  io.emit("onlineUsers", users);
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send current online users to the newly connected client
  socket.emit("onlineUsers", users);

  socket.on("requestOnlineUsers", () => {
    socket.emit("onlineUsers", users);
  });

  // JOIN
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("message", `${username} joined`);
    io.emit("userJoined", { id: socket.id, username: username });
    sendOnlineUsers();
  });

  // MESSAGE
  socket.on("sendMessage", (msg) => {
    const username = users[socket.id];
    io.emit("message", { id: socket.id, user: username, text: msg });

    // 🤖 AI BOT (if only 1 user)
    if (Object.keys(users).length === 1) {
      socket.emit("message", {
        user: "AI Bot",
        text: "No one is online. Ask me anything 🙂",
      });
    }
  });

  socket.on("directMessage", ({ toId, text }) => {
    const from = users[socket.id];
    const toName = users[toId] || "Unknown";
    socket.emit("directMessage", {
      type: "dm",
      self: true,
      from,
      toId,
      toName,
      text
    });
    if (toId !== socket.id) {
      io.to(toId).emit("directMessage", {
        type: "dm",
        self: false,
        from,
        toId,
        toName,
        text
      });
    }
  });

  socket.on("joinRoom", (room) => {
    socket.join(room);
    const roomLabel = roomLabels[room] || room;
    socket.emit("roomJoined", { room, roomLabel });
    io.to(room).emit("message", {
      type: "system",
      text: `${users[socket.id]} joined ${roomLabel}`
    });
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    const roomLabel = roomLabels[room] || room;
    socket.emit("roomLeft", { room, roomLabel });
    io.to(room).emit("message", {
      type: "system",
      text: `${users[socket.id]} left ${roomLabel}`
    });
  });

  socket.on("roomMessage", ({ room, text }) => {
    const username = users[socket.id];
    const roomLabel = roomLabels[room] || room;
    io.to(room).emit("roomMessage", {
      type: "room",
      room,
      roomLabel,
      user: username,
      text
    });
  });


  socket.on("askAI", async (question) => {
    const username = users[socket.id];
    io.emit("message", { id: socket.id, user: username, text: question });
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        max_tokens: 150,
      });
      
      const aiResponse = completion.choices[0].message.content;
      socket.emit("message", {
        user: "AI Bot",
        text: aiResponse,
      });
    } catch (error) {
      console.error("AI Error:", error);
      socket.emit("message", {
        user: "AI Bot",
        text: "Sorry, I'm having trouble connecting to my brain right now. Try again later!",
      });
    }
  });

  // TYPING
  socket.on("typing", () => {
    socket.broadcast.emit("typing", users[socket.id]);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // REACTION
  socket.on("react", ({ messageId, emoji }) => {
    io.emit("reactionUpdate", { messageId, emoji });
  });

  // DISCONNECT BUTTON
  socket.on("leave", () => {
    socket.disconnect();
  });

  // ADMIN KICK
  socket.on("kickUser", (id) => {
    io.to(id).disconnectSockets();
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit("message", `${username} left`);
    io.emit("userLeft", socket.id);
    sendOnlineUsers();
  });
});

// FILE UPLOAD
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
});

http.listen(3000, () => {
  console.log("Server running on port 3000");
});