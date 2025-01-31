# SYSTEM DESCRIPTION:

**The ChessWorld project is created to provide chess-playing experience for users worldwide. Built with a modern microservices architecture, ChessWorld leverages Docker to create a modular, scalable environment for development and deployment.**

---
### 	Microservices Overview
1. Frontend Service (`chessworld-frontend`)  
   The frontend service serves as the user-facing interface for the platform. Built with React, it provides users with an interface for playing chess, finding opponents, creating rooms and plaing with chess bot. The service interacts with backend APIs to fetch data dynamically and websockets for delivering real-time updates.
2. Room Service (`chessworld-room-service`)  
   This service manages the creation and lifecycle of chess game rooms. It facilitates matchmaking, room allocations, and ensures smooth communication between players during a game. The service handles the logic for room configurations and interactions. Also it handles chess logic for created games.
3. Auth Service (`chessworld-auth-service`)  
   The authentication service manages user login, registration, and session handling. It implements secure authentication mechanisms to protect user data.
4. Statistics Service (`chessworld-statistics-service`)  
   The statistics service created for matching players that want to find a game (matchmaking) and evaluates their rating after game is finished.
5. Database (`project-mysql`)  
   A MySQL database acts as the central storage for user profiles, game histories, and application data. It is designed ensuring low latency and high availability for queries.
6. Redis (`project-redis`)  
   Redis is employed as a caching layer to optimize performance. It stores frequently accessed data, such as active rooms and info about players, reducing the load on the database and speeding up response times.
7. RabbitMQ (`rabbitmq`)  
   RabbitMQ serves as the message broker, enabling asynchronous communication between microservices. This ensures that events such as matchmaking, and statistics computations are handled.
8. PhpMyAdmin (`project-phpmyadmin`)  
   PhpMyAdmin provides a user-friendly interface for managing the MySQL database. It simplifies database administration tasks such as query execution, schema updates, and data inspection.
9. NGINX (`nginx`)  
   Acting as the reverse proxy, NGINX routes requests to the appropriate microservices. It also handles SSL termination, ensuring secure and optimized access to the platform.
---
Key Features
- Scalability: The modular microservices architecture allows individual components to scale independently, accommodating growing user demands without overloading the entire system.
- Real-time Communication: Services like Redis and Websockets ensure real-time game updates and event handling.
- Security and Performance: With a dedicated authentication service and efficient caching layers, ChessWorld prioritizes user security.
  Conclusion  
  ChessWorld represents a cutting-edge solution for chess enthusiasts, blending modern technologies with a user-focused design. Its microservices architecture ensures adaptability and efficiency, positioning it as a robust platform for players at all skill levels.


# USER STORIES:

### User Stories

1. **Registration** - As a user, I want to register in the chess system to create an account.

2. **Login & Session Persistence** - As a user, I want to log in and maintain access even after leaving or closing the page.

3. **Game Room Creation** - As a user, I want to create a room and wait for an opponent to play with.

4. **Room List** - As a user, I want to see a list of available rooms to choose an opponent or connect with a friend.

5. **Find a Game** - As a user, I want to find a game to play chess online in a browser.

6. **Start a Game** - As a user, I want to start a game with another user to begin moving pieces.

7. **Chess Rules Compliance** - As a user, I want to move pieces according to standard FIDE chess rules.

8. **Turn-Based Gameplay** - As a user, I want to take turns making one move at a time for fair gameplay.

9. **Offer a Draw** - As a user, I want to offer a draw to conclude a game fairly when neither side has an advantage.

10. **Resignation** - As a user, I want to resign when I see no way to win, to gracefully concede the game.

11. **Time Controls** - As a user, I want to play with different time controls (Bullet, Blitz, Rapid, Classical).

12. **Timer Display** - As a user, I want to see a timer counting down my available time to manage my moves.

13. **Win by Timeout** - As a user, I want to win if my opponent’s time runs out.

14. **Draw by Insufficient Material** - As a user, I want the game to be declared a draw if neither player has enough material to checkmate.

15. **Premoves** - As a user, I want to make premoves to save time when I’m sure of my next moves.

16. **Play Against BOT** - As a user, I want to start a game with a BOT to play on my own.

17. **BOT Complexity** - As a user, I want to choose BOT complexity to play at different skill levels.

18. **Statistics Collection** - As a user, I want to collect statistics to analyze my progress.