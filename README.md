# BugSync

BugSync is a real-time collaborative debugging platform that helps developers report bugs, collaborate in live debugging rooms, execute code, discuss fixes, submit solutions, and mark accepted solutions as resolved.

## Features

- User Registration and Login
- JWT-based Authentication
- Secure Server-side Authorization
- Post Programming Bugs
- Community Bug Feed
- Bug Details and Solution Submission
- Real-time Collaborative Debugging with Socket.IO
- Monaco Code Editor
- Live Code Synchronization
- Live Chat
- Connected Developer Tracking
- Multi-language Code Execution using Judge0
- Custom Input and Output Console
- Save Live Debug Code as a Solution
- Accept Best Solution
- Automatic OPEN → SOLVED Bug Status
- Solved Bugs Become Read-only

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Monaco Editor
- Socket.IO Client
- Lucide React

### Backend
- Node.js
- Express.js
- Socket.IO
- JWT
- bcryptjs
- Judge0 API

### Database
- MySQL

## How BugSync Works

1. User registers or logs in.
2. User posts a programming bug.
3. Other developers view the bug from the community.
4. Developers can submit a normal solution or start a Live Debug session.
5. Multiple developers can join the same room using an invite link.
6. Developers collaboratively edit code using Monaco Editor.
7. Code can be executed using Judge0.
8. Developers can discuss the issue using live chat.
9. Working code can be saved as a solution.
10. Bug owner accepts the best solution.
11. Bug status changes from OPEN to SOLVED.
12. Solved bugs become read-only.

## Security

- Passwords are hashed using bcryptjs.
- JWT is used for authentication.
- Protected backend routes verify JWT tokens.
- Bug ownership is derived from the authenticated user.
- Only the bug owner can accept a solution.
- Solved bugs reject new solutions.

## Project Structure

```text
BugSync/
│
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── utils/
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── server.js
│
└── README.md
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Apurva1807/BugSync.git
cd BugSync
```

Install frontend dependencies:

```bash
cd client
npm install
npm run dev
```

Install backend dependencies:

```bash
cd server
npm install
node server.js
```

## Environment Variables

Create a `.env` file inside the `server` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=debugtogether
DB_PORT=3306
JWT_SECRET=your_secret_key
```

Do not upload the `.env` file to GitHub.

## Future Improvements

- AI-assisted bug explanation
- AI-generated debugging suggestions
- User profiles
- Search and filtering
- Notification system
- Room history
- Deployment
```bash
cd client
npm install
npm run dev

