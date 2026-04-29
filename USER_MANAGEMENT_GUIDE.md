# MongoDB User Management System

## Overview
Your chat application now includes a comprehensive user management system that stores all usernames and passwords securely in MongoDB. The system includes authentication, authorization, and admin controls.

## Features

### 🔐 Authentication
- **User Registration**: Secure signup with password hashing
- **User Login**: JWT-based authentication
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Token-based sessions with expiration

### 👥 User Management
- **User Profiles**: Username, email, role, creation date, last login
- **Role-based Access**: User and Admin roles
- **User Statistics**: Total users, recent registrations, active users

### 🛡️ Admin Panel
- **User Listing**: View all registered users
- **User Editing**: Modify usernames and emails
- **Role Management**: Promote/demote users to admin
- **User Deletion**: Remove users from the system
- **Online User Management**: Kick users from chat

### 🔑 Password Management
- **Change Password**: Users can update their passwords
- **Password Validation**: Minimum 6 characters required
- **Secure Updates**: Current password verification required

## Database Schema

### User Model
```javascript
{
  username: String (required, unique, 3-20 chars),
  password: String (required, hashed, min 6 chars),
  email: String (optional),
  role: String (enum: "user", "admin", default: "user"),
  isActive: Boolean (default: true),
  createdAt: Date,
  lastLogin: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user

### User Management Routes (`/users`) - Requires Authentication
- `GET /users/all` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user (Admin or self)
- `DELETE /users/:id` - Delete user (Admin only)
- `POST /users/change-password` - Change password (Authenticated user)
- `GET /users/stats/overview` - Get user statistics (Admin only)

## Security Features

### Password Security
- **Hashing**: bcrypt with 10 salt rounds
- **Minimum Length**: 6 characters
- **No Plain Text Storage**: Passwords are never stored in plain text

### Authentication
- **JWT Tokens**: JSON Web Tokens with 7-day expiration
- **Role-based Access**: Different permissions for users and admins
- **Token Verification**: Middleware validates tokens on protected routes

### Data Validation
- **Input Sanitization**: Username and email validation
- **Unique Constraints**: Prevents duplicate usernames
- **Type Checking**: MongoDB schema validation

## Setup Instructions

### 1. Environment Variables
Ensure your `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-secret-key-change-in-production
```

### 2. Create Admin User
Run the setup script to create the first admin user:
```bash
node create-admin.js
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change the password immediately after first login!**

### 3. Start the Application
```bash
npm start
```

## Usage Guide

### For Regular Users
1. **Sign Up**: Create account at `http://localhost:3000`
2. **Login**: Use your credentials to access the chat
3. **Change Password**: Click "🔑 Change Password" in the sidebar
4. **Chat**: Use all chat features (messages, rooms, polls, files)

### For Admin Users
1. **Login**: Use admin credentials
2. **Access Admin Panel**: Click "ADMIN" button in the header
3. **Manage Users**:
   - View all registered users
   - Edit user information
   - Promote/demote users
   - Delete users
   - Monitor online users

### Admin Panel Features
- **Online Users**: See currently connected users, kick if needed
- **All Users**: Complete list of registered users with management options
- **User Actions**:
  - **Edit**: Change username/email
  - **Make Admin**: Grant admin privileges
  - **Remove Admin**: Revoke admin privileges
  - **Delete**: Permanently remove user

## File Structure

```
project/
├── models/
│   └── User.js              # User schema and model
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # User management routes
├── public/
│   ├── index.html           # Main chat interface
│   ├── auth.html            # Login/signup page
│   ├── script.js            # Client-side functionality
│   └── style.css            # Styling
├── server.js                # Main server file
├── create-admin.js          # Admin user creation script
└── .env                     # Environment variables
```

## Security Best Practices

### Password Policy
- Minimum 6 characters
- Encourage strong passwords
- Regular password changes

### Admin Access
- Limit admin accounts
- Regular audit of admin actions
- Secure admin password storage

### Data Protection
- Never log passwords
- Use HTTPS in production
- Regular database backups

### Session Management
- JWT token expiration (7 days)
- Secure token storage (localStorage)
- Automatic logout on token expiry

## Troubleshooting

### Common Issues

**"User already exists"**
- Username must be unique
- Check existing users in admin panel

**"Invalid token"**
- Token may have expired (7 days)
- Try logging in again

**"Not authorized"**
- Check user role permissions
- Admin-only actions require admin role

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file

### Database Queries

Check users in MongoDB:
```javascript
// Connect to MongoDB and run:
db.users.find()
// Find admin users:
db.users.find({role: "admin"})
// Count total users:
db.users.countDocuments()
```

## Future Enhancements

- Email verification for new accounts
- Password reset via email
- Two-factor authentication
- User profile pictures
- User activity logs
- Bulk user operations
- User export/import functionality

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Create admin user
node create-admin.js

# Start the server
npm start

# Access the application
# Open: http://localhost:3000
# Admin login: admin / admin123
```

Your user management system is now fully operational with MongoDB integration! 🎉