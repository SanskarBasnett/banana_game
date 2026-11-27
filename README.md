# Banana Puzzle Game

**Version 2.0.0**

## 1. Project Overview

The Banana Puzzle Game is a web-based puzzle game that uses the Banana API to provide visual number puzzles. Users can register, log in, solve puzzles, and earn points. Their scores are saved to their accounts using an SQLite database.

Version 2.0.0 adds a hardcoded demo admin account with an admin dashboard. Players play puzzles; the admin manages users and scores.

## 2. Main Features

- User registration and login.
- Secure password hashing using bcrypt.
- Session-based user authentication.
- Random puzzle retrieval through the Banana API.
- Answer validation and score calculation.
- Persistent score storage using SQLite.
- User-specific score tracking and a global top-10 leaderboard.
- **Admin dashboard** to view users, delete users, and reset scores.
- Admins are excluded from the leaderboard and player ranks.

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
│   │   ├── admin/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── game/
│   │   ├── profile/
│   │   └── ui/
│   ├── admin.html
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

## 6. Admin Account

For this coursework demo, the admin is hardcoded and created automatically when the app starts.

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `admin123` |
| Username | `admin` |

Log in with these credentials, then click the **Admin** link in the header to open `/admin.html`.

These credentials are for demonstration only and are not intended for real deployment.

## 7. Admin Dashboard

The admin dashboard allows the admin to:

- view all users and their scores,
- reset an individual player's score,
- reset all scores, which clears the leaderboard,
- delete a user and their scores.

Admin pages and APIs are protected by a role check. A logged-in player receives `403`; a user who is not logged in receives `401`.

Players cannot be promoted or demoted through the UI. The admin role is fixed by the hardcoded account above.

## 8. Application Architecture

The project uses a modular client-server architecture.

- **Client:** Displays the interface and handles user interactions.
- **Server:** Processes requests and manages application logic.
- **Routes:** Direct incoming requests to the appropriate controllers.
- **Controllers:** Handle authentication, gameplay, scores, and admin operations.
- **Middleware:** Checks authentication (`requireAuth`) and admin role (`requireRole`).
- **Services:** Communicate with the external Banana API.
- **Database:** Stores user accounts and scores, including the `role` column.

## 9. External API

The application uses the Banana API to retrieve visual number puzzles. The API provides a puzzle image and its corresponding numerical solution. The server handles the API request and keeps the correct answer in the user's session for answer validation.
