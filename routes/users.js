const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Get all users (Admin only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, {
      password: 0, // Exclude password from response
      __v: 0
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ msg: "Server error retrieving users" });
  }
});

// Get user by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, {
      password: 0, // Exclude password
      __v: 0
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ msg: "Server error retrieving user" });
  }
});

// Update user (Admin only or self)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if user can update (admin or self)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ msg: "Not authorized to update this user" });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ msg: "Current password required to change password" });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ msg: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ msg: "New password must be at least 6 characters long" });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update other fields
    if (username && username !== user.username) {
      // Check if username already exists
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ msg: "Username already exists" });
      }
      user.username = username;
    }

    if (email !== undefined) {
      user.email = email;
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(userId, { password: 0, __v: 0 });

    res.json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ msg: "Server error updating user" });
  }
});

// Delete user (Admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (req.user.id === userId) {
      return res.status(400).json({ msg: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      success: true,
      msg: `User ${user.username} deleted successfully`
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ msg: "Server error deleting user" });
  }
});

// Change password (for logged in user)
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "New password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ msg: "Current password is incorrect" });
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      msg: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ msg: "Server error changing password" });
  }
});

// Get user statistics
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        recentUsers,
        activeUsers
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ msg: "Server error retrieving statistics" });
  }
});

module.exports = router;