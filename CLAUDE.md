# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FIFA 2026 Prode is a World Cup prediction platform with group/knockout match predictions, bonus tournament predictions, private leagues, and real-time leaderboards.

## Commands

### Backend (Java/Spring Boot)

```bash
cd backend

# Run with dev profile (H2 database)
./mvnw spring-boot:run                                    # Unix
mvnw.cmd spring-boot:run                                  # Windows

# Run with prod profile (PostgreSQL + Azure AD)
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run        # Unix
set SPRING_PROFILES_ACTIVE=prod && mvnw.cmd spring-boot:run  # Windows

# Build
./mvnw clean package

# Run tests
./mvnw test

# Run single test class
./mvnw test -Dtest=ClassName
```

### Frontend (React/Vite)

```bash
cd frontend

# Install dependencies (includes MSAL)
npm install

# Run development server (port 5173)
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Local PostgreSQL (via Docker)

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop
docker-compose down
```

## Architecture

### Backend Structure (`backend/src/main/java/com/fifa2026/prode/`)

- **entity/**: JPA entities - `User`, `Team`, `Match`, `Prediction`, `BonusPrediction`, `League`
- **repository/**: Spring Data JPA repositories
- **service/**: Business logic including `ScoringService` for point calculations
- **controller/**: REST endpoints under `/api/*`
- **security/**: Azure AD JWT authentication with `AzureAdJwtConverter`
- **config/**: Security (OAuth2 Resource Server), CORS, and `DataInitializer` for seeding

### Frontend Structure (`frontend/src/`)

- **config/authConfig.ts**: MSAL configuration for Azure AD
- **components/MsalProvider.tsx**: MSAL React provider wrapper
- **hooks/useMsalAuth.ts**: Custom hook for Azure AD authentication
- **services/api.ts**: Axios instance with MSAL token interceptor
- **store/authStore.ts**: Zustand store for user info (auth state managed by MSAL)
- **types/index.ts**: TypeScript interfaces for all entities
- **pages/**: Route components (Dashboard, Matches, Leaderboard, Leagues, etc.)
- **components/**: Reusable UI (MatchCard, LeaderboardTable, BonusPredictions, etc.)

### Authentication Flow

1. User clicks "Sign in with Microsoft" on Login page
2. MSAL redirects to Azure AD for authentication
3. Azure AD returns token to frontend
4. Frontend includes token in API requests via Axios interceptor
5. Backend validates token via Spring OAuth2 Resource Server
6. `AzureAdJwtConverter` extracts user info and provisions user in DB (JIT)
7. User info stored in Zustand for UI display

### Key Patterns

- **Spring Profiles**: `dev` (H2) and `prod` (PostgreSQL + Azure AD)
- **OAuth2 Resource Server**: Backend validates Azure AD JWTs
- **MSAL.js**: Frontend handles Azure AD login/logout/token refresh
- **JIT User Provisioning**: Users created in DB on first SSO login
- **Lombok**: Entity boilerplate reduction
- **Vite Proxy**: `/api` proxied to backend at :8080

## Scoring System (in ScoringService.java)

**Group Stage**: Exact score = 5 pts, Correct result (1X2) = 3 pts

**Knockout Stage**: Exact score = 5 pts, Correct advancing team = 4 pts, Correct result wrong advancing = 2 pts

**Bonus**: Champion = 15 pts, Runner-up = 10 pts, Third place = 8 pts, Top scorer = 10 pts

## Environment Configuration

### Backend (`backend/.env.example`)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` - PostgreSQL
- `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` - Azure AD
- `SPRING_PROFILES_ACTIVE` - `dev` or `prod`

### Frontend (`frontend/.env.example`)
- `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID` - Azure AD

## Development Notes

- **Dev profile**: H2 database console at `http://localhost:8080/h2-console` (JDBC: `jdbc:h2:file:./data/prodedb`, user: `sa`)
- **Prod profile**: Requires PostgreSQL and Azure AD configuration
- Match predictions lock at kickoff time (enforced server-side)
- Match stages: GROUP, ROUND_OF_32, ROUND_OF_16, QUARTERFINAL, SEMIFINAL, THIRD_PLACE, FINAL
- Admin roles managed locally in database (not from Azure AD groups)
