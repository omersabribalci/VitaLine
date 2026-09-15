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
- **Core:** Node.js, TypeScript, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication & Security:** JSON Web Tokens (JWT), bcryptjs, role checks
- **API Documentation:** Swagger UI
- **Logging:** Structured JSON logs written to stdout/stderr and collected by Docker

## Project Structure

- `/frontend` - React client, built as static files and served by Nginx.
- `/backend/api-gateway` - Public backend entry point.
- `/backend/auth-service` - Users, credentials, sessions, and admin startup.
- `/backend/patient-service` - Patient profiles.
- `/backend/doctor-service` - Doctor profiles and unavailable dates.
- `/backend/appointment-service` - Appointments, booking policy, and slot rules.

## Getting Started

### Prerequisites
- Docker Desktop with Docker Compose
- Node.js 24 when running or testing services outside Docker

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd VitaLine
   ```

2. Create the ignored root `.env` from `.env.example` and replace the sample
   secrets and admin credentials.

### Environment Configuration

Every executable component has a local `.env` and a Docker-specific
`.env.docker`. Real shared secrets stay in the ignored root `.env`; the
versioned Docker files contain only addresses, ports, and database names.

### Running the Application

Docker Compose is the primary development runtime:

From the project root:

```bash
docker compose up -d --build
docker compose ps
```

For local commands, Compose automatically combines `docker-compose.yml` with
`docker-compose.override.yml`. The frontend is then available at
`http://localhost:8080`, and MongoDB is bound only to `127.0.0.1:27018`.
Application containers use `mongodb:27017` through the private Compose network.

Coolify must use `/docker-compose.yml` as its Compose location. It deploys only
the production-safe base file, so neither MongoDB nor the frontend publishes a
host port. Coolify's proxy reaches the frontend directly on container port 80.

## API Documentation

The microservice API contract is exposed through the API Gateway. After the
Compose stack starts, open `http://localhost:8080/api-docs`.

## License

This project is licensed under the ISC License.
