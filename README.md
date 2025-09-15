# Calendar Application

## Overview

<img width="1865" height="958" alt="Image" src="https://github.com/user-attachments/assets/305ac335-dbab-4b27-9104-bd7ef35b3193" />

A full-stack calendar application with event scheduling, recurring events, and user management.

## Features

- **User Authentication**: Register, login, and manage user profiles
- **Event Management**: Create, edit, and delete calendar events
- **Recurring Events**: Set up events with various recurrence patterns (daily, weekly, monthly, yearly)
- **Event Overrides**: Modify individual instances of recurring events
- **Trash Management**: Soft delete with restoration capability

## Demo

Check out the video demonstration of the app here: [Video Demo](https://drive.google.com/file/d/1aX2xdfN671dMg551-0n1C6l0OfuuVGLF/view?usp=sharing).

## Tech Stack

### Frontend
- React 19.1.0
- React Router 7.6.0
- Axios for API calls
- Tailwind CSS for styling
- Vite as build tool

### Backend
- Node.js with Express
- Prisma ORM
- MySQL database
- JWT for authentication
- bcrypt for password hashing
- date-fns for date manipulation

## Project Structure

```
calendar/
├── backend/                 # Backend Node.js application
│   ├── prisma/              # Database schema and migrations
│   └── src/                 # Source code
│       ├── app/             # Application code
│       │   ├── controllers/ # Route controllers
│       │   └── middlewares/ # Express middlewares
│       ├── public/          # Static files
│       ├── routes/          # API routes
│       └── utils/           # Utility functions
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   └── src/                 # Source code
│       ├── assets/          # Images and other assets
│       ├── components/      # React components
│       ├── context/         # React context providers
│       ├── pages/           # Page components
│       └── routes/          # Route definitions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd calendar
   ```

2. Install dependencies
   ```
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the `backend` directory with the following variables:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/calendar_db"
   JWT_SECRET="your-jwt-secret"
   ```

4. Set up the database
   ```
   cd backend
   npx prisma migrate dev
   ```

5. Run the application
   ```
   # In the backend directory
   npm run dev
   
   # In the frontend directory (in a separate terminal)
   npm run dev
   ```

6. Access the application
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login
- `PUT /api/auth/update-profile`: Update user profile
- `PUT /api/auth/change-password`: Change user password

### Events
- `GET /api/events`: Get events for a specific date range
- `GET /api/events/all-events`: Get all user events
- `GET /api/events/:id`: Get a specific event
- `POST /api/events/create`: Create a new event
- `PUT /api/events/update/:id`: Update an event
- `DELETE /api/events/delete/:id`: Soft delete an event
- `GET /api/events/deleted`: Get all deleted events
- `PATCH /api/events/restore/:id`: Restore a deleted event
- `DELETE /api/events/force/:id`: Permanently delete an event
- `GET /api/events/search`: Search events by query

## Acknowledgments

- React and the React community
- Express.js
- Prisma ORM
- TailwindCSS
- All open-source contributors to the libraries used in this project
