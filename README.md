# VitaLine

VitaLine is a modern, full-stack web application designed with a robust backend architecture and an interactive user interface. It features a responsive frontend powered by React and Material UI, paired with a secure, scalable Node.js and Express backend.

## Tech Stack

### Frontend
- **Core:** React 19, TypeScript, Vite
- **Styling & UI Components:** Material UI (MUI), Tailwind CSS, Styled Components
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Data Visualization & Inputs:** MUI X-Charts, MUI Date Pickers
- **Form Handling:** React Hook Form

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication & Security:** JSON Web Tokens (JWT), bcryptjs, Express Rate Limit
- **API Documentation:** Swagger UI
- **Logging & Monitoring:** Winston, Morgan

## Project Structure

- `/frontend` - The React client application.
- `/backend` - The Express REST API and database models.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (running locally or via MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd VitaLine
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

**Backend Setup**
Navigate to the `backend` directory and create a `.env` file based on `.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**Frontend Setup**
Navigate to the `frontend` directory and create a `.env` file based on `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

**Option A: Running Separately**

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend:
```bash
cd frontend
npm run dev
```

**Option B: Running Concurrently**
The frontend package is configured to run both servers concurrently.
```bash
cd frontend
npm start
```

## API Documentation

Swagger API documentation is integrated into the backend. Once the server is running, you can explore the API endpoints by navigating to:
`http://localhost:5000/api-docs` (port may vary based on your environment configuration).

## License

This project is licensed under the ISC License.
