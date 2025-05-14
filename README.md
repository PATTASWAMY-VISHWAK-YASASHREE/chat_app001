# Discord Clone

A full-stack Discord-like chat application built with React, Node.js, Express, and Socket.IO.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Channel creation and management
- Message persistence with SQL database
- Responsive UI design

## Tech Stack

### Backend
- Node.js
- Express.js
- Sequelize ORM (SQL)
- Socket.IO
- JWT Authentication
- Winston (logging)
- Jest (testing)

### Frontend
- React
- Vite
- React Router
- Context API
- Tailwind CSS
- Socket.IO Client
- Vitest & React Testing Library

## Getting Started

### Prerequisites

- Node.js (v14+)
- MySQL or another SQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/discord-clone.git
cd discord-clone
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=discord_clone
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

5. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Debugging

### Backend Debugging
```bash
cd backend
npm run debug
```

This will start the server with the debug flag enabled. You can see debug logs by setting the DEBUG environment variable:

```bash
DEBUG=discord-clone:* npm run dev
```

### Frontend Debugging

The frontend includes a logger utility that automatically logs different levels of messages based on the environment.

## Project Structure

### Backend Structure
```
backend/
├── config/         # Database and app configuration
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Sequelize models
├── routes/         # API routes
├── socket/         # Socket.IO handlers
├── utils/          # Utility functions
├── __tests__/      # Test files
└── server.js       # Entry point
```

### Frontend Structure
```
frontend/
├── public/         # Static files
├── src/
│   ├── assets/     # Images and other assets
│   ├── components/ # React components
│   ├── context/    # React context providers
│   ├── pages/      # Page components
│   ├── services/   # API services
│   ├── utils/      # Utility functions
│   ├── __tests__/  # Test files
│   ├── App.jsx     # Main App component
│   └── main.jsx    # Entry point
└── index.html      # HTML template
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.