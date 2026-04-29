const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.username);
      return;
    }

    // Create admin user
    const adminUser = new User({
      username: "admin",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: "admin123"
      email: "admin@chatapp.com",
      role: "admin"
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Role: admin");
    console.log("\n⚠️  IMPORTANT: Change the default password after first login!");

  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the function
createAdminUser();