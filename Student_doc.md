# ChessWorld - README

## System Description
The ChessWorld is an online chess system that enables users to play chess in real-time, manage game rooms, authenticate, and track game statistics. It follows a microservices architecture and is containerized using Docker. The platform incorporates services such as RabbitMQ for message queuing, Redis for caching, MySQL for database storage, and Nginx for reverse proxying.

---

## User Stories

### Authentication & Account Management
- **Registration:** Users can create an account.
- **Login & Session Persistence:** Users can log in and maintain access even after closing the page.

### Game Room & Gameplay
- **Game Room Creation:** Users can create a room and wait for an opponent.
- **Room List:** Users can see a list of available rooms.
- **Find a Game:** Users can search for an opponent.
- **Start a Game:** Users can start a game with another player.
- **Chess Rules Compliance:** Moves follow standard FIDE chess rules.
- **Turn-Based Gameplay:** Players take turns making moves.
- **Offer a Draw:** Users can propose a draw.
- **Resignation:** Users can resign from a game.
- **Time Controls:** Games support Bullet, Blitz, Rapid, and Classical formats.
- **Timer Display:** Users see a countdown timer for moves.
- **Win by Timeout:** Players win if their opponent's time runs out.
- **Draw by Insufficient Material:** Games end in a draw if neither player has checkmate material.
- **Premoves:** Players can make premoves to save time.
- **Play Against BOT:** Users can play against an AI opponent.
- **BOT Complexity:** Users can select different skill levels for the BOT.

### Statistics
- **Statistics Collection:** Users can track and analyze their game progress.

---

## Containers

### Frontend
- **Container Name:** `frontend`
- **Description:** Hosts the user interface for the chess platform (React + Node.js).
- **User Stories:** Find a game, start a game, play against BOT, etc.
- **Ports:** Served via Nginx (no explicit exposure).
- **Persistence:** No data storage; relies on backend services.
- **External Connections:** Connects to `room-service`, `auth-service` and `statistic-service`.

### Room Service
- **Container Name:** `room-service`
- **Description:** Manages game rooms, matchmaking, and gameplay sessions.
- **User Stories:** 
  - *Game Room Creation*
  - *Room List*
  - *Find a Game*
  - *Start a Game*
  - *Chess Rules Compliance*
  - *Turn-Based Gameplay*
  - *Offer a Draw*
  - *Resignation*
  - *Time Controls*
  - *Timer Display*
  - *Win by Timeout*
  - *Draw by Insufficient Material:*
  - *Premoves*
  - *Play Against BOT* 
  - *BOT Complexity* 
- **Ports:** `3001`
- **Persistence:** Uses Redis for temporary user states, MySQL for saving game state.
- **External Connections:** Connects to RabbitMQ and Redis.

### Authentication Service
- **Container Name:** `auth-service`
- **Description:** Manages user authentication and sessions.
- **User Stories:**
  - *Registration*
  - *Login & Session Persistence*
- **Ports:** `3002`
- **Persistence:** Stores user credentials in MySQL.
- **External Connections:** Connects to MySQL.

### Statistics Service
- **Container Name:** `statistics-service`
- **Description:** Collects and provides game statistics.
- **User Stories:**
  - *Statistics Collection*
- **Ports:** `3003`
- **Persistence:** Stores statistics in MySQL.
- **External Connections:** Connects to RabbitMQ and MySQL.

### RabbitMQ
- **Container Name:** `rabbitmq`
- **Description:** Message queue for real-time updates.
- **Ports:** `15672` (management UI)
- **Persistence:** Stores messages persistently on the host machine.
- **External Connections:** Used by `room-service` and `statistics-service`.

### Redis
- **Container Name:** `redis`
- **Description:** Caching system for game states and room management.
- **Ports:** `6379`
- **Persistence:** Stores data in memory with optional persistence to disk.
- **External Connections:** Used by `room-service`.

### MySQL
- **Container Name:** `mysql`
- **Description:** Main database for user and game statistics storage.
- **User Stories:** Registration, login & session persistence, statistics collection.
- **Ports:** `3306`
- **Persistence:** Stores user data and game statistics.
- **External Connections:** Used by `auth-service` and `statistics-service`.

### Nginx
- **Container Name:** `nginx`
- **Description:** Reverse proxy for routing requests and serving the frontend.
- **Ports:** `80`, `443`, `8443`
- **Persistence:** No data storage.
- **External Connections:** Routes traffic to `frontend`, `room-service`, `auth-service`, and `statistics-service`.

---

## Technology Stack
- **Frontend:** React, Node.js
- **Backend Services:** Node.js, Express, Nest.js
- **Databases:** MySQL
- **Messaging & Caching:** RabbitMQ, Redis
- **Proxy & Load Balancing:** Nginx
- **Containerization:** Docker

---

## Deployment & Setup
### Prerequisites
- Docker & Docker Compose installed.

### Running the System
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/chess-platform.git
   cd chess-platform
   ```
2. Start the containers:
   ```sh
   docker-compose up -d
   ```
3. Access the application:
    - Frontend: `http://localhost`
    - RabbitMQ UI: `http://localhost:15672`
    - MySQL: `localhost:3306`

### Stopping the System
```sh
docker-compose down
```

### Logs & Debugging
To view logs for a specific container:
```sh
docker logs -f <container_name>
```



