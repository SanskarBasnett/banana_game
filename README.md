# Banana Puzzle Game

**Version 2.0.0**

## 1. Project Overview

The Banana Puzzle Game is a web-based puzzle game that uses the Banana API to provide visual number puzzles. Users can register, log in, solve puzzles, and earn points. Their scores are saved to their accounts using an SQLite database.

Version 2.0.0 adds a hardcoded demo admin account with an admin dashboard. Players play puzzles; the admin manages users and scores.

## 2. Main Features

- User registration and login.
- Secure password hashing using bcrypt.
- Session-based user authentication with session regeneration on login.
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

## 4. Component Table

Each folder or file has one clearly defined responsibility. The dependency column shows what each component reads from or calls — keeping these links explicit helps identify where a change in one component might affect another.

| Folder / File | Responsibility | Depends On |
|---|---|---|
| `client/js/events.js` | Defines all custom event names and the `emit()` helper | Nothing — zero dependencies |
| `client/js/app.js` | Checks authentication on page load, bootstraps other modules | `apiClient.js`, `Ui.controller.js` |
| `client/js/auth/authController.js` | Handles login and register form submissions | `apiClient.js`, `/api/auth/*` routes |
| `client/js/api/apiClient.js` | Wraps every server API call in one place | Fetch API |
| `client/js/game/gameController.js` | Puzzle lifecycle: start, answer, solution | `apiClient.js`, `timerController.js`, `leaderboardController.js`, `events.js` |
| `client/js/game/timerController.js` | Countdown timer display and expiry callback | DOM only |
| `client/js/game/leaderboardController.js` | Fetches and renders the leaderboard table | `apiClient.js` |
| `client/js/ui/Ui.controller.js` | Shared UI helpers: player name, toast, date formatting | DOM only |
| `server/server.js` | Creates the Express app, registers middleware and routes | All route files, `express-session` |
| `server/routes/authRoutes.js` | Maps `/api/auth/*` URLs to auth controller functions | `authController.js`, `authMiddleware.js` |
| `server/routes/gameRoutes.js` | Maps `/api/game/*` URLs to game controller functions | `gameController.js`, `authMiddleware.js` |
| `server/routes/adminRoutes.js` | Maps `/api/admin/*` URLs to admin controller functions | `adminController.js`, `roleMiddleware.js` |
| `server/controllers/authController.js` | Register, login, logout, profile update logic | `bcrypt`, `database.js` |
| `server/controllers/gameController.js` | Puzzle delivery, answer checking, stats, leaderboard | `bananaApiService.js`, `database.js` |
| `server/middleware/authMiddleware.js` | Blocks unauthenticated requests; attaches `req.user` | `database.js` |
| `server/middleware/roleMiddleware.js` | Blocks requests from users without the required role | `database.js`; reuses `req.user` if `authMiddleware` already attached it |
| `server/services/bananaApiService.js` | Fetches puzzles from the external Banana API | External Banana API (HTTPS) |
| `server/config/database.js` | Opens the SQLite connection and creates tables | `better-sqlite3` |

## 5. Architecture Diagram

```
Browser
  │
  │  HTTP requests (fetch API)
  ▼
Express Routes  (/api/auth, /api/game, /api/admin)
  │
  │  requireAuth / requireRole middleware validates session
  ▼
Controllers  (authController, gameController, adminController)
  │                        │
  │                        │  external HTTP (HTTPS + JSON)
  │                        ▼
  │               bananaApiService  ──►  Banana API
  │                                      (marcconrad.com)
  │  SQL queries (better-sqlite3)
  ▼
SQLite Database  (users, scores)
```

## 6. Project Structure

```text
banana_game/
├── client/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── admin/
│   │   ├── api/
│   │   │   └── apiClient.js
│   │   ├── auth/
│   │   │   └── authController.js
│   │   ├── events.js          ← custom event registry
│   │   ├── game/
│   │   │   ├── gameController.js
│   │   │   ├── leaderboardController.js
│   │   │   └── timerController.js
│   │   ├── profile/
│   │   └── ui/
│   │       └── Ui.controller.js
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
│   │   └── bananaApiService.js
│   └── server.js
├── database/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 7. Event-Driven Architecture

The client uses the browser's built-in `CustomEvent` / `window.dispatchEvent` as a lightweight event bus. All event names are defined as constants in `client/js/events.js` so a typo in any emitter or listener fails visibly rather than silently.

| Event | Constant | Emitted by | Listened to by | When |
|---|---|---|---|---|
| `player:updated` | `AppEvents.PLAYER_UPDATED` | `gameController.js` (after answer), `profileController.js` (after save) | `gameController.js` | Player score or profile changes |
| `puzzle:started` | `AppEvents.PUZZLE_STARTED` | `gameController.js` | Any future module (sound, analytics) | A new puzzle round begins |
| `puzzle:ended` | `AppEvents.PUZZLE_ENDED` | `gameController.js` | Any future module | A round ends (answered or timeout) |
| `profile:saved` | `AppEvents.PROFILE_SAVED` | `profileController.js` | None yet (reserved for future modules) | User saves profile changes |

Using events instead of direct function calls means the profile module can trigger a leaderboard refresh without importing `gameController.js`, and future modules (e.g. sound effects) can react to game state without modifying existing files.

The countdown timer derives remaining time from a wall-clock timestamp (`puzzleEndsAt = Date.now() + 30000`) rather than decrementing a counter. This keeps the display accurate even when the browser throttles `setInterval` in background tabs.

## 8. How to Run the Project

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

## 9. External API — Banana API

The server fetches puzzles from the external Banana API operated by Marc Conrad at the University of Bedfordshire.

| Property | Value |
|---|---|
| URL | `https://marcconrad.com/uob/banana/api.php?out=json&base64=no` |
| Method | `GET` |
| Protocol | HTTPS (encrypted in transit) |
| Response format | JSON |
| Key fields returned | `question` (image URL string), `solution` (integer 0–9) |
| Timeout | 5 seconds (`AbortSignal.timeout`) |
| Retries on failure | Up to 2 retries with 500 ms delay |

The call is entirely isolated in `server/services/bananaApiService.js`. No route or controller imports `fetch` or knows the API URL. This means the external provider can be replaced or mocked for testing by changing one file. The response is validated before use: `question` must be a non-empty string and `solution` must be an integer between 0 and 9. Values outside these constraints are rejected with a descriptive error logged server-side.

If all retries fail, the server returns a `500` with a user-friendly message rather than crashing or leaking internal error details.

**Trade-off:** The game depends on an external service. If the Banana API goes offline, no new puzzles can be loaded. A local puzzle generator would remove this dependency but would require creating and storing puzzle assets.

## 10. Admin Account

For this coursework demo, the admin is hardcoded and created automatically when the app starts.

| Field | Value |
|---|---|
| Email | `admin@gmail.com` |
| Password | `admin123` |
| Username | `admin` |

Log in with these credentials, then click the **Admin** link in the header to open `/admin.html`.

These credentials are for demonstration only and are not intended for real deployment. In production, admin credentials would be supplied via environment variables or a one-time seed script, never hardcoded in source.

## 11. Admin Dashboard

The admin dashboard allows the admin to:

- view all users and their scores,
- reset an individual player's score,
- reset all scores, which clears the leaderboard,
- delete a user and their scores.

Admin pages and APIs are protected by a role check. A logged-in player receives `403`; a user who is not logged in receives `401`. This distinction implements least privilege: authentication (401) proves identity; authorisation (403) enforces what that identity is permitted to do.

## 12. Authentication and Virtual Identity

Passwords are hashed with `bcrypt` (cost factor 12) before storage. The plaintext password is never saved or logged.

On login, `req.session.regenerate()` is called before the user ID is written to the session. This prevents session-fixation attacks, where an attacker who obtained a pre-login session ID could otherwise reuse it after authentication.

Sessions are managed server-side by `express-session`. The session ID is delivered to the browser as an `httpOnly`, `sameSite=lax` cookie named `banana.sid`:

| Cookie attribute | Purpose |
|---|---|
| `httpOnly` | JavaScript cannot read the cookie, blocking XSS-based session theft |
| `sameSite=lax` | The cookie is not sent on cross-site POST requests, mitigating CSRF |
| `secure` (production) | Cookie is only sent over HTTPS, preventing interception in transit |
| `maxAge: 8 hours` | Sessions expire automatically; idle accounts are not held open indefinitely |
| `name: banana.sid` | Avoids disclosing the session library (`connect.sid`) in browser DevTools |

The `requireAuth` middleware validates both the session and the database on every protected request, so a deleted account cannot continue to make API calls using an old session.

Admin routes additionally pass through `requireRole("admin")`, which checks `req.user.role`. A logged-in player calling `/api/admin/users` receives `403 Forbidden`.

**Current limitations (acceptable for coursework, would change in production):**

- `secure: false` locally — HTTPS is not available on `localhost` without a certificate.
- In-memory session store — sessions are lost on server restart; production would use a persistent store (e.g. Redis or a database-backed store).
- Hardcoded demo admin — production credentials would use environment variables.

**Alternatives considered:** JWT tokens would eliminate the server-side session store and work better for a stateless or multi-server deployment, but require implementing token expiry, refresh, and revocation explicitly. Server-side sessions handle all of that transparently, which is appropriate for a single-server application.

## 13. Application Architecture

The project uses a modular client-server architecture.

- **Client:** Displays the interface and handles user interactions.
- **Server:** Processes requests and manages application logic.
- **Routes:** Direct incoming requests to the appropriate controllers.
- **Controllers:** Handle authentication, gameplay, scores, and admin operations.
- **Middleware:** Checks authentication (`requireAuth`) and admin role (`requireRole`).
- **Services:** Communicate with the external Banana API.
- **Database:** Stores user accounts and scores, including the `role` column.

## 14. Version Control

The project uses Git for version control, hosted on GitHub.

- **Commits** are kept small and single-purpose (e.g. adding admin routes, documenting components, removing the duplicate score endpoint) so the history shows what changed and why.
- **Tags** (`v1.0.0`, `v2.0.0`) mark stable releases and make it easy to compare versions or roll back.
- **Branches** isolate features and fixes from the main branch during development.

The main process improvement for a team setting would be pull request code reviews before merging, which would catch issues earlier and distribute knowledge of the codebase.
