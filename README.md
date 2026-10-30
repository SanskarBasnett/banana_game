# Banana Puzzle Game

## 1. Project Overview

The Banana Puzzle Game is a web-based puzzle game that uses the Banana API to provide visual number puzzles. Users can register, log in, solve puzzles, and earn points. Their scores are saved to their accounts using an SQLite database.

## 2. Main Features

- User registration and login.
- Secure password hashing using bcrypt.
- Session-based user authentication.
- Random puzzle retrieval through the Banana API.
- Answer validation and score calculation.
- Persistent score storage using SQLite.
- User-specific score tracking.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Webpage structure |
| CSS | Interface styling |
| JavaScript | Frontend functionality |
| Node.js | Server-side runtime |
| Express.js | Backend framework and API routes |
| SQLite | User and score storage |
| better-sqlite3 | SQLite database integration |
| bcrypt | Password hashing |
| express-session | User session management |
| Banana API | Puzzle generation |
| Git and GitHub | Version control and source code hosting |

## 4. Project Structure

```text
banana_game/
├── client/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── game/
│   │   └── ui/
│   ├── index.html
│   ├── login.html
│   └── register.html
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── server.js
├── database/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 5. How to Run the Project

1. Install Node.js and npm.
2. Clone or download the project repository.
3. Open the project folder in VS Code.
4. Install dependencies:

   `npm install`

5. Create a `.env` file using `.env.example` as a reference.
6. Configure the environment variables, including a session secret.
7. Start the development server:

   `npm run dev`

8. Open `http://localhost:3000` in a web browser.
9. Register an account and log in to play.

## 6. Application Architecture

The project uses a modular client-server architecture.

- **Client:** Displays the interface and handles user interactions.
- **Server:** Processes requests and manages application logic.
- **Routes:** Direct incoming requests to the appropriate controllers.
- **Controllers:** Handle authentication, gameplay, and score operations.
- **Services:** Communicate with the external Banana API.
- **Database:** Stores user accounts and scores.

## 7. External API

The application uses the Banana API to retrieve visual number puzzles. The API provides a puzzle image and its corresponding numerical solution. The server handles the API request and keeps the correct answer in the user's session for answer validation.

