const socket = io();
const user = localStorage.getItem("currentUser");

if (!user) {
  window.location.href = "auth.html";
}
const input = document.getElementById("message");
const messages = document.getElementById("messages");
const typingDiv = document.getElementById("typing");
const chatControls = document.getElementById("chatControls");
const disconnectedUsers = document.getElementById("disconnectedUsers");
const languageSelect = document.getElementById("languageSelect");
const translationStatus = document.getElementById("translationStatus");
const sendButton = document.querySelector(".input button");
const leaveButton = document.querySelector(".leave-button");
const askAIButton = document.getElementById("askAIBtn");
const welcomePanel = document.getElementById("welcomePanel");
const topBar = document.querySelector(".topBar");
const pollPanel = document.getElementById("pollPanel");
const filePortal = document.getElementById("filePortal");
const portalStatus = document.getElementById("portalStatus");
const adminPanel = document.getElementById("adminPanel");
const adminUserList = document.getElementById("adminUserList");
const adminBtn = document.getElementById("adminBtn");
const usersList = document.getElementById("users");
const dmSelect = document.getElementById("dmSelect");
const modePanel = document.getElementById("modePanel");
const chatModeLabel = document.getElementById("chatModeLabel");
const dmControls = document.querySelector(".dm-controls");
const roomControls = document.querySelector(".room-controls");
const roomStatus = document.querySelector(".room-status");

let username = "";
let currentLanguage = "en";
let activePoll = null;
let onlineUsers = {};
let chatMode = "global";
let currentRoom = null;
let currentTargetId = null;
let currentTargetName = "";

const translationMap = {
  es: {
    "File:": "Archivo:",
    "is typing...": "está escribiendo...",
    "Connected": "Conectado",
    "Global Chat Pro": "Chat Global Pro",
    "Send": "Enviar",
    "Leave Chat": "Salir",
    "Disconnect": "Desconectar",
    "Upload File": "Subir archivo",
    "Current: English": "Actual: Inglés",
    "Type message...": "Escribe un mensaje...",
    "Start Chat": "Iniciar chat",
    "Start Poll": "Iniciar encuesta",
    "Start File Sharing Portal": "Iniciar portal de archivos",
    "Ask AI": "Preguntar IA",
    "Disconnect": "Desconectar",
    "Share File": "Compartir archivo",
    "Create Poll": "Crear encuesta"
  },
  fr: {
    "File:": "Fichier:",
    "is typing...": "est en train d'écrire...",
    "Connected": "Connecté",
    "Global Chat Pro": "Chat Global Pro",
    "Send": "Envoyer",
    "Leave Chat": "Quitter",
    "Disconnect": "Déconnecter",
    "Upload File": "Téléverser",
    "Current: English": "Courant: Anglais",
    "Type message...": "Tapez un message...",
    "Start Chat": "Démarrer le chat",
    "Start Poll": "Démarrer un sondage",
    "Start File Sharing Portal": "Démarrer le portail de fichiers",
    "Ask AI": "Demander à l'IA",
    "Disconnect": "Déconnecter",
    "Share File": "Partager fichier",
    "Create Poll": "Créer un sondage"
  },
  de: {
    "File:": "Datei:",
    "is typing...": "schreibt...",
    "Connected": "Verbunden",
    "Global Chat Pro": "Globaler Chat Pro",
    "Send": "Senden",
    "Leave Chat": "Chat verlassen",
    "Disconnect": "Trennen",
    "Upload File": "Datei hochladen",
    "Current: English": "Aktuell: Englisch",
    "Type message...": "Nachricht eingeben...",
    "Start Chat": "Chat starten",
    "Start Poll": "Umfrage starten",
    "Start File Sharing Portal": "Dateifreigabe-Portal starten",
    "Ask AI": "KI fragen",
    "Disconnect": "Trennen",
    "Share File": "Datei teilen",
    "Create Poll": "Umfrage erstellen"
  }
};

function translateText(text, lang) {
  if (lang === "en") return text;
  const map = translationMap[lang] || {};
  return map[text] || text;
}

function updateLanguageUI() {
  currentLanguage = languageSelect.value;
  translationStatus.textContent = `Current: ${languageSelect.options[languageSelect.selectedIndex].text}`;
  sendButton.textContent = translateText("Send", currentLanguage);
  leaveButton.textContent = translateText("Disconnect", currentLanguage);
  if (askAIButton) askAIButton.textContent = translateText("Ask AI", currentLanguage);
  const messageInput = document.querySelector(".input input");
  messageInput.placeholder = translateText("Type message...", currentLanguage);
}

function ensureUser() {
  if (!username) {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("currentUser");
    if (!token || !user) return false;
    username = user;
    socket.emit("join", username);
  }
  return true;
}

function startChat() {
  if (!ensureUser()) return;
  activateChat();
}

function askAI() {
  if (!ensureUser()) return;
  activateChat();
  const question = prompt("Ask AI a question:");
  if (!question) return;
  socket.emit("askAI", question);
}

function activateChat() {
  chatMode = "global";
  currentRoom = null;
  currentTargetId = null;
  currentTargetName = "";
  chatModeLabel.textContent = "Global Chat";
  modePanel.style.display = "flex";
  dmControls.style.display = "flex";
  roomControls.style.display = "flex";
  roomStatus.style.display = "none";
  welcomePanel.style.display = "none";
  topBar.style.display = "flex";
  chatControls.style.display = "flex";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  messages.style.display = "block";
  typingDiv.style.display = "block";
  updateLanguageUI();
}

function startPoll() {
  if (!ensureUser()) return;
  welcomePanel.style.display = "none";
  topBar.style.display = "none";
  chatControls.style.display = "none";
  pollPanel.style.display = "block";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "none";
  messages.style.display = "none";
  typingDiv.style.display = "none";
}

function openFilePortal() {
  if (!ensureUser()) return;
  welcomePanel.style.display = "none";
  topBar.style.display = "none";
  chatControls.style.display = "none";
  filePortal.style.display = "block";
  pollPanel.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "none";
  messages.style.display = "none";
  typingDiv.style.display = "none";
}

function startDirectMessage() {
  if (!ensureUser()) return;
  if (Object.keys(onlineUsers).length <= 1) {
    alert("No one else is online for a direct message.");
    return;
  }
  chatMode = "dm";
  currentRoom = null;
  currentTargetId = null;
  currentTargetName = "";
  welcomePanel.style.display = "none";
  topBar.style.display = "flex";
  chatControls.style.display = "flex";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "flex";
  dmControls.style.display = "flex";
  roomControls.style.display = "none";
  roomStatus.style.display = "none";
  chatModeLabel.textContent = "Direct Message";
  messages.style.display = "block";
  typingDiv.style.display = "block";
  updateLanguageUI();
  renderOnlineUsers();
}

function startDM() {
  const targetId = dmSelect.value;
  if (!targetId) {
    alert("Please select a user to DM.");
    return;
  }
  openDirectMessage(targetId);
}

function openDirectMessage(targetId) {
  if (!ensureUser()) return;
  const targetName = onlineUsers[targetId];
  if (!targetName) {
    alert("That user is no longer online.");
    return;
  }
  currentTargetId = targetId;
  currentTargetName = targetName;
  chatMode = "dm";
  currentRoom = null;
  chatModeLabel.textContent = `DM with ${currentTargetName}`;
  modePanel.style.display = "flex";
  dmControls.style.display = "flex";
  roomControls.style.display = "none";
  welcomePanel.style.display = "none";
  topBar.style.display = "flex";
  chatControls.style.display = "flex";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  messages.style.display = "block";
  typingDiv.style.display = "block";
  updateLanguageUI();
  dmSelect.value = targetId;
}

function joinRoom(room) {
  if (!ensureUser()) return;
  currentRoom = room;
  currentTargetId = null;
  currentTargetName = "";
  chatMode = "room";
  chatModeLabel.textContent = room === "dark-room" ? "Dark Room" : "Project Discussion";
  modePanel.style.display = "flex";
  dmControls.style.display = "none";
  roomControls.style.display = "none";
  roomStatus.style.display = "flex";
  welcomePanel.style.display = "none";
  topBar.style.display = "flex";
  chatControls.style.display = "flex";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  messages.style.display = "block";
  typingDiv.style.display = "block";
  socket.emit("joinRoom", room);
  updateLanguageUI();
}

function joinDarkRoom() {
  joinRoom("dark-room");
}

function joinProjectDiscussion() {
  joinRoom("project-discussion");
}

function leaveRoom() {
  if (!currentRoom) return;
  socket.emit("leaveRoom", currentRoom);
  currentRoom = null;
  chatMode = "global";
  chatModeLabel.textContent = "Global Chat";
  activateChat();
}

function updateFileDetails(file) {
  if (!file) {
    document.getElementById("fileName").textContent = "None";
    document.getElementById("fileType").textContent = "None";
    document.getElementById("fileSize").textContent = "0 KB";
    return;
  }

  document.getElementById("fileName").textContent = file.name;
  document.getElementById("fileType").textContent = file.type || "Unknown";
  document.getElementById("fileSize").textContent = `${(file.size / 1024).toFixed(2)} KB`;
}

function createPoll() {
  const question = document.getElementById("pollQuestion").value.trim();
  const options = [
    document.getElementById("pollOption1").value.trim(),
    document.getElementById("pollOption2").value.trim()
  ].filter(Boolean);

  if (!question || options.length < 2) {
    alert("Please enter a question and at least two options.");
    return;
  }

  activePoll = {
    question,
    options: options.map((text) => ({ text, votes: 0 }))
  };
  renderPoll();
}

function renderPoll() {
  const pollResults = document.getElementById("pollResults");
  pollResults.innerHTML = `
    <div class="poll-card">
      <strong>${activePoll.question}</strong>
      <div class="poll-options"></div>
    </div>
  `;

  const optionsContainer = pollResults.querySelector(".poll-options");
  activePoll.options.forEach((option, index) => {
    const optionEl = document.createElement("div");
    optionEl.className = "poll-option";
    optionEl.innerHTML = `
      <span>${option.text}</span>
      <button onclick="votePoll(${index})">Vote</button>
      <span class="vote-count">${option.votes} votes</span>
    `;
    optionsContainer.appendChild(optionEl);
  });
}

function votePoll(index) {
  activePoll.options[index].votes += 1;
  renderPoll();
}

function setLanguage() {
  updateLanguageUI();
}

function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  if (chatMode === "dm") {
    if (!currentTargetId) {
      alert("Pick a user from the DM selector first.");
      return;
    }
    socket.emit("directMessage", {
      toId: currentTargetId,
      text: msg
    });
    input.value = "";
    return;
  }

  if (chatMode === "room" && currentRoom) {
    socket.emit("roomMessage", {
      room: currentRoom,
      text: msg
    });
    input.value = "";
    return;
  }

  socket.emit("sendMessage", msg);
  input.value = "";
}

function renderMessage(data) {
  const li = document.createElement("li");
  li.className = "msg";

  if (typeof data === "string") {
    li.textContent = translateText(data, currentLanguage);
  } else {
    let prefix = "";
    let label = "";
    let messageClass = "other"; // default class

    if (data.type === "dm") {
      prefix = data.self ? `You → ${data.toName}` : `${data.from} → You`;
      label = `<span class="message-badge">DM</span>`;
      messageClass = data.self ? "me" : "private";
    } else if (data.type === "room") {
      prefix = data.user;
      label = `<span class="message-badge">${data.roomLabel}</span>`;
      messageClass = "other";
    } else if (data.type === "system") {
      prefix = "System";
      label = `<span class="message-badge">System</span>`;
      messageClass = "other";
    } else {
      prefix = data.user;
      if (data.id === socket.id) {
        messageClass = "me";
      }
    }

    li.className += ` ${messageClass}`;
    li.innerHTML = `${label} <b>${prefix}:</b> ${translateText(data.text, currentLanguage)}`;
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}

function renderOnlineUsers() {
  usersList.innerHTML = "";
  dmSelect.innerHTML = "<option value=''>Select user...</option>";

  Object.entries(onlineUsers).forEach(([id, name]) => {
    const li = document.createElement("li");
    li.textContent = id === socket.id ? `${name} (You)` : name;
    if (id !== socket.id) {
      li.classList.add("user-clickable");
      li.addEventListener("click", () => openDirectMessage(id));
      const option = document.createElement("option");
      option.value = id;
      option.textContent = name;
      dmSelect.appendChild(option);
    }
    usersList.appendChild(li);
  });
}

function leaveChat() {
  if (username) {
    const li = document.createElement("li");
    li.textContent = username;
    disconnectedUsers.appendChild(li);
    socket.emit("leave");
    username = "";
  }
  topBar.style.display = "none";
  chatControls.style.display = "none";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "none";
  welcomePanel.style.display = "block";
  messages.style.display = "none";
  typingDiv.style.display = "none";
}

socket.on("message", (data) => {
  renderMessage(data);
});

socket.on("directMessage", (data) => {
  renderMessage(data);
});

socket.on("roomMessage", (data) => {
  renderMessage(data);
});

socket.on("roomJoined", (data) => {
  renderMessage({ type: "system", text: `You joined ${data.roomLabel}` });
});

socket.on("roomLeft", (data) => {
  renderMessage({ type: "system", text: `You left ${data.roomLabel}` });
});

socket.on("onlineUsers", (users) => {
  onlineUsers = users;
  renderOnlineUsers();
});

socket.on("userJoined", (data) => {
  onlineUsers[data.id] = data.username;
  renderOnlineUsers();
});

socket.on("userLeft", (socketId) => {
  delete onlineUsers[socketId];
  renderOnlineUsers();
});

socket.on("typing", (user) => {
  typingDiv.innerText = translateText(`${user} is typing...`, currentLanguage);
});

socket.on("stopTyping", () => {
  typingDiv.innerText = "";
});

input.addEventListener("input", () => {
  if (!username) return;
  socket.emit("typing");
  setTimeout(() => socket.emit("stopTyping"), 1000);
});

function react(id, emoji) {
  socket.emit("react", { messageId: id, emoji });
}

socket.on("reactionUpdate", ({ messageId, emoji }) => {
  console.log("Reaction:", messageId, emoji);
});

async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();
  socket.emit("sendMessage", `File: ${data.fileUrl}`);
}

async function uploadFilePortal() {
  const file = document.getElementById("fileInputPortal").files[0];
  if (!file) {
    portalStatus.textContent = "Please select a file first.";
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/upload", { method: "POST", body: formData });
  const data = await res.json();
  portalStatus.textContent = `Shared: ${data.fileUrl}`;
  socket.emit("sendMessage", `File: ${data.fileUrl}`);
}

/*window.addEventListener("load", () => {
  topBar.style.display = "none";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "none";
  messages.style.display = "none";
  typingDiv.style.display = "none";
});Remove Comment if GPT idea not working*/

function openAdminPanel() {
  if (!ensureUser()) return;
  welcomePanel.style.display = "none";
  topBar.style.display = "none";
  chatControls.style.display = "none";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "block";
  messages.style.display = "none";
  typingDiv.style.display = "none";
  updateAdminUserList();
}

function closeAdminPanel() {
  adminPanel.style.display = "none";
  welcomePanel.style.display = "block";
}

function updateAdminUserList() {
  adminUserList.innerHTML = "";
  Object.keys(onlineUsers).forEach(socketId => {
    const userDiv = document.createElement("div");
    userDiv.className = "admin-user-item";
    userDiv.innerHTML = `
      <span class="user-name">${onlineUsers[socketId]}</span>
      <button onclick="kickUser('${socketId}')" class="kick-btn">Kick</button>
    `;
    adminUserList.appendChild(userDiv);
  });

  // Also load all registered users for management
  loadAllUsers();
}

function kickUser(socketId) {
  if (confirm(`Are you sure you want to kick ${onlineUsers[socketId]}?`)) {
    socket.emit("kickUser", socketId);
  }
}

// Load all registered users from database
async function loadAllUsers() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("/users/all", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      displayAllUsers(data.users);
    } else {
      console.error("Failed to load users:", data.msg);
    }
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Display all users in admin panel
function displayAllUsers(users) {
  const userManagementDiv = document.createElement("div");
  userManagementDiv.id = "userManagement";
  userManagementDiv.innerHTML = `
    <h4>All Registered Users (${users.length})</h4>
    <div id="allUsersList"></div>
  `;

  // Remove existing user management section if it exists
  const existing = document.getElementById("userManagement");
  if (existing) existing.remove();

  adminPanel.appendChild(userManagementDiv);

  const allUsersList = document.getElementById("allUsersList");
  users.forEach(user => {
    const userDiv = document.createElement("div");
    userDiv.className = "db-user-item";
    userDiv.innerHTML = `
      <div class="user-info">
        <strong>${user.username}</strong>
        <span class="user-role">${user.role}</span>
        <small>Created: ${new Date(user.createdAt).toLocaleDateString()}</small>
        ${user.lastLogin ? `<small>Last login: ${new Date(user.lastLogin).toLocaleDateString()}</small>` : '<small>Never logged in</small>'}
      </div>
      <div class="user-actions">
        <button onclick="editUser('${user._id}', '${user.username}', '${user.email || ''}')" class="edit-btn">Edit</button>
        <button onclick="deleteUser('${user._id}', '${user.username}')" class="delete-btn">Delete</button>
        ${user.role !== 'admin' ? `<button onclick="makeAdmin('${user._id}', '${user.username}')" class="admin-btn">Make Admin</button>` : `<button onclick="removeAdmin('${user._id}', '${user.username}')" class="admin-btn">Remove Admin</button>`}
      </div>
    `;
    allUsersList.appendChild(userDiv);
  });
}

// Edit user
async function editUser(userId, currentUsername, currentEmail) {
  const newUsername = prompt("Enter new username:", currentUsername);
  const newEmail = prompt("Enter new email:", currentEmail || "");

  if (!newUsername) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: newUsername,
        email: newEmail
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("User updated successfully!");
      loadAllUsers(); // Refresh the list
    } else {
      alert("Error updating user: " + data.msg);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Error updating user");
  }
}

// Delete user
async function deleteUser(userId, username) {
  if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone!`)) {
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("User deleted successfully!");
      loadAllUsers(); // Refresh the list
    } else {
      alert("Error deleting user: " + data.msg);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("Error deleting user");
  }
}

// Make user admin
async function makeAdmin(userId, username) {
  if (!confirm(`Make "${username}" an admin?`)) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "admin"
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`${username} is now an admin!`);
      loadAllUsers(); // Refresh the list
    } else {
      alert("Error making user admin: " + data.msg);
    }
  } catch (error) {
    console.error("Error making user admin:", error);
    alert("Error making user admin");
  }
}

// Remove admin privileges
async function removeAdmin(userId, username) {
  if (!confirm(`Remove admin privileges from "${username}"?`)) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`/users/${userId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: "user"
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(`${username} is no longer an admin!`);
      loadAllUsers(); // Refresh the list
    } else {
      alert("Error removing admin privileges: " + data.msg);
    }
  } catch (error) {
    console.error("Error removing admin:", error);
    alert("Error removing admin privileges");
  }
}

// Change password function
async function changePassword() {
  const currentPassword = prompt("Enter your current password:");
  const newPassword = prompt("Enter your new password:");
  const confirmPassword = prompt("Confirm your new password:");

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("All fields are required!");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords don't match!");
    return;
  }

  if (newPassword.length < 6) {
    alert("New password must be at least 6 characters long!");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/users/change-password", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert("Password changed successfully!");
    } else {
      alert("Error changing password: " + data.msg);
    }
  } catch (error) {
    console.error("Error changing password:", error);
    alert("Error changing password");
  }
}

// Update online users when users join/leave
socket.on("userJoined", (data) => {
  onlineUsers[data.id] = data.username;
  updateAdminUserList();
});

socket.on("userLeft", (socketId) => {
  delete onlineUsers[socketId];
  updateAdminUserList();
});

// Initialize online users list when connecting
socket.on("connect", () => {
  // Request current online users from server
  socket.emit("requestOnlineUsers");
});

socket.on("onlineUsers", (users) => {
  onlineUsers = users;
  updateAdminUserList();
});

/*window.addEventListener("load", () => {
  topBar.style.display = "none";
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  messages.style.display = "none";
  typingDiv.style.display = "none";
}); Next added Window event listner if not works then take asitis*/
window.addEventListener("load", () => {
  topBar.style.display = "flex";
  activateChat(); //force to start AI to identify the Issue of message
  pollPanel.style.display = "none";
  filePortal.style.display = "none";
  adminPanel.style.display = "none";
  modePanel.style.display = "none";
  messages.style.display = "none";
  typingDiv.style.display = "none";
});