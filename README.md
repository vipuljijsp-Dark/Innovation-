# Chat App
A real-time chat application with AI integration, built with Node.js, Express, Socket.IO, and MongoDB.

## Features
- Real-time messaging with Socket.IO
- User authentication with JWT
- Private messaging (DM)
- Chat rooms (Dark Room, Project Discussion)
- File sharing
- Polls
- AI chatbot integration (OpenAI)
- Admin panel for user management
- Multi-language support
- Responsive design

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- OpenAI API key (for AI features)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=mongodb://localhost:27017/chatapp
   ```

4. Start MongoDB service

5. Start the application:
   ```bash
   npm start
   ```

6. Open your browser and go to `http://localhost:3000`

## Usage

1. **Authentication**: Sign up or log in using the auth page
2. **Chat**: Start chatting in the global chat or join rooms
3. **Direct Messages**: Click on online users to send private messages
4. **Rooms**: Join "Dark Room" or "Project Discussion" rooms
5. **AI Chat**: Ask questions to the AI bot
6. **File Sharing**: Upload and share files
7. **Polls**: Create and vote on polls
8. **Admin Panel**: Manage users (admin functionality)

## Technologies Used
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcrypt
- **AI**: OpenAI API
- **Frontend**: HTML5, CSS3, JavaScript
- **File Upload**: Multer

## Project Structure
```
├── server.js          # Main server file
├── models/            # MongoDB models
│   └── User.js        # User schema
├── routes/            # API routes
│   └── auth.js        # Authentication routes
├── public/            # Frontend files
│   ├── index.html     # Main chat interface
│   ├── auth.html      # Login/signup page
│   ├── script.js      # Client-side JavaScript
│   └── style.css      # Stylesheets
├── uploads/           # Uploaded files directory
└── .env              # Environment variables
``` 
