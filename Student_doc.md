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
- **Stop find Game:** Users can stop search for an opponent.
- **Start a Game:** Users can start a game with another player.
- **Chess Rules Compliance:** Moves follow standard FIDE chess rules.
- **Turn-Based Gameplay:** Players take turns making moves.
- **Draw offering:** Users can propose a draw.
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
- **Type:** `frontend`
- **Description:** Hosts the user interface for the chess platform (React + Node.js).
- **User Stories:** Find a game, start a game, play against BOT, etc.
- **Ports:** Served via Nginx (no explicit exposure).
- **Persistence:** No data storage; relies on backend services.
- **External Connections:** Connects to `room-service`, `auth-service` and `statistic-service`.
- **Pages:**

| Name         | Description                                | Related Microservice | User Stories        |
|--------------|--------------------------------------------|----------------------|---------------------|
| Login        | Page for user login                        | auth-service         | Login               |
| Registration | Page for user registration                 | auth-service         | Registration        |
| Game         | Page for game process and controlling game | room-service         |  Chess Rules Compliance, Turn-Based Gameplay, Draw offering, Resignation, Time Controls, Timer Display, Win by Timeout, Draw by Insufficient Material, Premoves |
| Home         | Page for finding or creating game          | room-service         | Game Room Creation, Room List, Find a Game, Start a Game, Play Against BOT, BOT Complexity               |

### Room Service
- **Container Name:** `room-service`
- **Type:** `backend`
- **Description:** Manages game rooms, matchmaking, and gameplay sessions.
- **User Stories:** 
  - *Game Room Creation*
  - *Room List*
  - *Find a Game*
  - *Start a Game*
  - *Chess Rules Compliance*
  - *Turn-Based Gameplay*
  - *Draw offering*
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
- **Endpoints:**

**AMQP**

| Queue name | Description                    | User Stories |
|------------|--------------------------------| ------------ |
| `room-queue` | Recieving users match for game | Game Room Creation |


**HTTP**

| HTTP METHOD | URL                        | Description                          | User Stories |
|------------|----------------------------|--------------------------------------|-------------|
| **GET**    | `/`                        | Retrieve a list of all rooms        | Room List  |
| **GET**    | `/activeRooms`             | Get active rooms for the authenticated user | Find a Game, Game Room Creation |
| **GET**    | `/:roomId`                 | Get details of a specific room      | Start a Game |
| **POST**   | `/surrender/:roomId`       | Surrender a game                    | Resignation |
| **DELETE** | `/:roomId`                 | Delete a specific room              | Game Room Creation |
| **GET**    | `/stockfish/analyze?fen=`  | Analyze a position using Stockfish  | Play Against BOT, BOT Complexity |

**Websocket**

| Event Name           | Description                               | User Stories                                |
|----------------------|-------------------------------------------|---------------------------------------------|
| `user:setUserData`  | Set user data (ID and email)             | Game Room Creation                          |
| `user:createRoom`   | Create a game room                       | Game Room Creation, Start a Game            |
| `user:startGameWithBot` | Start a game against Stockfish bot   | Play Against BOT, BOT Complexity            |
| `room:joinRoom`     | Join a room                              | Find a Game, Start a Game                   |
| `room:leaveRoom`    | Leave a room                             | Find a Game                                 |
| `room:delete`       | Delete a room                            | Game Room Creation                          |
| `room:handleMove`   | Make a move in a game                    | Turn-Based Gameplay, Chess Rules Compliance |
| `room:handleOfferDraw` | Offer a draw                          | Draw offering                               |
| `room:acceptDraw`   | Accept a draw offer                      | Draw offering                               |
| `room:denyDraw`     | Reject a draw offer                      | Draw offering                               |
| `room:surrender`    | Surrender a game                         | Resignation                                 |
| `room:getTime`      | Get the current time on the game clock   | Timer Display, Win by Timeout               |
| `room:timeRunOut`   | Handle timeout when a player's clock expires | Win by Timeout                              |
| `user:startGame`    | Start matchmaking for a game             | Find a Game                                 |
| `user:stopGameFind` | Stop matchmaking for a game              | Stop find game                              |


### Authentication Service
- **Container Name:** `auth-service`
- **Type:** `backend`
- **Description:** Manages user authentication and sessions.
- **User Stories:**
  - *Registration*
  - *Login & Session Persistence*
- **Ports:** `3002`
- **Persistence:** Stores user credentials in MySQL.
- **External Connections:** Connects to MySQL.
- **Endpoints:**

**HTTP**

  | HTTP METHOD | URL    | Description                                                                       | User Stories          |
  |-------------|--------|-----------------------------------------------------------------------------------|-----------------------|
  | POST        | /login | Users can log in and maintain access.                 | Login |
  | GET         | /refresh-access | Users can refresh access token and maintain access even after closing the page. | Session Persistence |
  | POST        | /register | Users can create an account. | Registration |

### Statistics Service
- **Container Name:** `statistics-service`
- **Type:** `backend`
- **Description:** Collects and provides game statistics.
- **User Stories:**
  - *Statistics Collection*
- **Ports:** `3003`
- **Persistence:** Stores statistics in MySQL.
- **External Connections:** Connects to RabbitMQ and MySQL.
- **Endpoints:**

**AMQP**

| Queue name | Description                                      | User Stories          |
|-------|--------------------------------------------------|-----------------------|
| statistics-queue | Users can track and analyze their game progress. | Statistics Collection |
| find-game-queue | Users can search for an opponent.                | Find a Game           |
| stop-find-game-queue | Users can stop search for an opponent.           | Stop find game         |

### RabbitMQ
- **Container Name:** `rabbitmq`
- **Type:** `messagebroker`
- **Description:** Message queue for real-time updates.
- **Ports:** `15672` (management UI)
- **Persistence:** Stores messages persistently on the host machine.
- **External Connections:** Used by `room-service` and `statistics-service`.

### Redis
- **Container Name:** `redis`
- **Type:** `database`
- **Description:** Caching system for game states and room management.
- **Ports:** `6379`
- **Persistence:** Stores data in memory with optional persistence to disk.
- **External Connections:** Used by `room-service`.

### MySQL
- **Container Name:** `mysql`
- **Type:** `database`
- **Description:** Main database for user and game statistics storage.
- **User Stories:** Registration, login & session persistence, statistics collection.
- **Ports:** `3306`
- **Persistence:** Stores user data and game statistics.
- **External Connections:** Used by `auth-service` and `statistics-service`.

### Nginx
- **Container Name:** `nginx`
- **Type:** `webserver`
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

4. Initialize databases and users
```sql
CREATE DATABASE `project`;
CREATE DATABASE `room-service`;
CREATE DATABASE `statistic-service`;
       
CREATE USER 'project-user'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'project-user'@'%';
FLUSH PRIVILEGES;
      
CREATE USER 'room-user'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON *.* TO 'room-user'@'%';
FLUSH PRIVILEGES;
      
CREATE USER 'statistics-user'@'%' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'statistics-user'@'%';
FLUSH PRIVILEGES;
```

### Stopping the System
```sh
docker-compose down
```

### Logs & Debugging
To view logs for a specific container:
```sh
docker logs -f <container_name>
```



