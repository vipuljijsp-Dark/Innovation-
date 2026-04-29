# Chat App - MongoDB Setup Guide

## Overview
This chat application now fully integrates with MongoDB for persistent user data storage. When users sign up or log in through `auth.html`, their credentials are securely saved in the MongoDB database.

## Prerequisites
1. **Node.js** (v14 or higher)
2. **MongoDB** (local or Atlas connection)
3. **npm** (comes with Node.js)

## Installation Steps

### 1. Install Node Modules
```bash
cd h:\Recordings\Project\withmngodb\Fixed\final_modified_project
npm install
```

This installs all required dependencies:
- `express` - Web framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `multer` - File uploads
- `openai` - AI integration
- `dotenv` - Environment variables

### 2. MongoDB Setup (Choose One)

#### Option A: Local MongoDB (Recommended for Development)

**Windows with MongoDB installed:**
```bash
# Open PowerShell as Administrator
mongod
```

This starts MongoDB on `mongodb://localhost:27017`

**Or using MongoDB Atlas (Cloud):**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Copy it to `.env` file as `MONGODB_URI`

#### Option B: Docker (Alternative)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Configure Environment Variables

Edit `.env` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/chatapp

# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-in-production

# AI API Keys (optional)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start the Application

**Terminal 1 - Start MongoDB** (if using local MongoDB):
```bash
mongod
```

**Terminal 2 - Start the Node.js server:**
```bash
cd h:\Recordings\Project\withmngodb\Fixed\final_modified_project
npm start
# Or directly:
node server.js
```

You should see:
```
✓ Connected to MongoDB successfully
✓ Database: mongodb://localhost:27017/chatapp
Server running on port 3000
```

### 5. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## How It Works

### User Registration (Signup)
1. User enters username and password in `auth.html`
2. Client sends data to `/auth/signup` endpoint
3. Server validates input
4. Password is hashed using bcrypt
5. User data is saved to MongoDB
6. Success message is shown to the user

### User Login
1. User enters credentials in `auth.html`
2. Client sends data to `/auth/login` endpoint
3. Server finds user in MongoDB
4. Password is compared with hashed password
5. JWT token is generated
6. User is authenticated and redirected to chat

### Database Structure

**User Collection:**
```json
{
  "_id": ObjectId,
  "username": "string (unique)",
  "password": "string (hashed)",
  "email": "string (optional)",
  "createdAt": "Date",
  "lastLogin": "Date",
  "updatedAt": "Date"
}
```

## Testing

### Check MongoDB Connection
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-04-24T...",
  "mongodb": "Connected"
}
```

### Check Database Status
```bash
curl http://localhost:3000/api/db-status
```

### Test Signup via Command Line
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Test Login via Command Line
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## MongoDB Compass (GUI Tool)

To visually inspect your MongoDB database:

1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to `mongodb://localhost:27017`
3. View the `chatapp` database
4. See users in the `users` collection

## Features

✅ **Secure Password Hashing** - Using bcrypt with salt rounds: 10
✅ **JWT Authentication** - Tokens expire in 7 days
✅ **Input Validation** - Both client and server-side
✅ **Error Handling** - Detailed error messages
✅ **User Tracking** - Last login timestamp
✅ **Duplicate Prevention** - Username uniqueness enforced
✅ **MongoDB Logging** - Connection status tracking

## Troubleshooting

### "MongoDB connection error"
- Ensure MongoDB service is running
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB is accessible on `localhost:27017`

### "Username already exists"
- Choose a different username
- Or delete the user from MongoDB first

### "Invalid username or password"
- Check spelling of username and password
- Ensure you're using correct credentials

### "Cannot connect to server"
- Verify MongoDB is running
- Check if port 27017 is not blocked by firewall
- Restart the Node.js server

## Production Deployment

Before deploying to production:

1. **Change JWT_SECRET** to a strong random string
2. **Use MongoDB Atlas** instead of local MongoDB
3. **Enable HTTPS** for secure communication
4. **Set up environment variables** on your hosting platform
5. **Add rate limiting** for authentication endpoints
6. **Enable CORS** if frontend is on different domain

## File Structure

```
project/
├── server.js              # Main server file
├── models/
│   └── User.js            # User schema with validation
├── routes/
│   └── auth.js            # Authentication endpoints
├── public/
│   ├── auth.html          # Login/Signup page
│   ├── index.html         # Chat interface
│   ├── script.js          # Client JavaScript
│   └── style.css          # Styling
├── .env                   # Environment variables
├── package.json           # Dependencies
└── SETUP_GUIDE.md        # This file
```

## Next Steps

1. ✅ MongoDB database is set up
2. ✅ User authentication is working
3. ✅ Credentials are saved securely
4. Now enjoy the chat application!

For more help, check the README.md or review the auth routes in `routes/auth.js`
