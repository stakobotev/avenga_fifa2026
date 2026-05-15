# FIFA 2026 World Cup Prode

A prediction platform for the FIFA World Cup 2026 with group and knockout logic, exact score scoring, bonus tournament predictions, automatic point calculation, locked deadlines, and dynamic leaderboard ranking.

## Features

- **Match Predictions**: Predict exact scores for all World Cup matches
- **Knockout Predictions**: Predict who advances in knockout rounds
- **Bonus Predictions**: Predict Champion, Runner-up, Third Place, and Top Scorer
- **Private Leagues**: Create or join leagues with invite codes
- **Leaderboard**: Real-time ranking with multiple tiebreakers
- **Auto-locking**: Predictions lock at match kickoff
- **Mobile-friendly**: Responsive design for all devices

## Scoring System

### Group Stage
- Exact score: **5 points**
- Correct result (1X2): **3 points**

### Knockout Stage
- Exact score (90 min): **5 points**
- Correct advancing team: **4 points**
- Correct result, wrong advancing team: **2 points**

### Bonus Predictions
- Champion: **15 points**
- Runner-up: **10 points**
- Third Place: **8 points**
- Top Scorer: **10 points**

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2, Spring Security, JPA/Hibernate
- **Database**: H2 (dev) / PostgreSQL (prod)
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **State Management**: Zustand, TanStack Query

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Maven 3.8+

### Backend Setup

```bash
cd backend

# Build and run
./mvnw spring-boot:run

# Or on Windows
mvnw.cmd spring-boot:run
```

The backend will start at `http://localhost:8080`

**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/grouped` - Get teams grouped by group letter

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/upcoming` - Get upcoming matches
- `GET /api/matches/stage/{stage}` - Get matches by stage
- `GET /api/matches/group/{groupLetter}` - Get matches by group

### Predictions
- `POST /api/predictions` - Create/update prediction
- `GET /api/predictions` - Get user's predictions
- `POST /api/predictions/bonus` - Create/update bonus prediction
- `GET /api/predictions/bonus` - Get user's bonus predictions

### Leagues
- `POST /api/leagues` - Create league
- `GET /api/leagues/my` - Get user's leagues
- `POST /api/leagues/join/{inviteCode}` - Join league
- `GET /api/leagues/{id}/leaderboard` - Get league leaderboard

### Leaderboard
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/leaderboard/me` - Get current user stats

### Admin (requires ADMIN role)
- `POST /api/teams` - Create team
- `POST /api/matches` - Create match
- `PUT /api/matches/{id}/result` - Update match result

## Project Structure

```
FIFA_2026/
├── backend/
│   ├── src/main/java/com/fifa2026/prode/
│   │   ├── config/          # Security, CORS config
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data repositories
│   │   ├── security/        # JWT authentication
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── store/           # State management
    │   ├── types/           # TypeScript types
    │   └── utils/           # Utility functions
    └── public/
```

## Database Schema

### Main Entities
- **User**: User accounts with roles
- **Team**: National teams with group assignments
- **Match**: Match schedule with results
- **Prediction**: User match predictions
- **BonusPrediction**: Tournament bonus predictions
- **League**: Private leagues with members

## Development

### H2 Console
Access the H2 database console at `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/prodedb`
- Username: `sa`
- Password: (empty)

### Environment Variables

For production, set these environment variables:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/prode
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your_256_bit_secret_key
```

## License

Internal use only.
