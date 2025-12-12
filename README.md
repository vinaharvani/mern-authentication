# mern-authentication

A simple MERN-based authentication system with user registration, login, JWT authentication, email verification, and password reset.

## Clone the repository
```
git clone https://github.com/vinaharvani/mern-authentication.git

```
## Backend Setup

```
cd server
npm install
```

## Create .env file inside /server

```
MONGODB_URL=your_mongodb_connection
JWT_SECRET=your_secret_key
NODE_ENV='development'
SMTP_USER=your_smtp_user
SMTP_PASS=smtp_key
SENDER_EMAIL=sender_email
```

## start Server
```
npm start
```

## Frontend Setup

```
cd client
npm install
```

## Create .env file inside /client

```
VITE_BACKEND_URL=http://localhost:4000
```

## Start frontend

```
npm run dev
```
