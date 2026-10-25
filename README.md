# InkWell Blog Application — Module 02: Backend Development

## Tech stack
Node.js, Express.js, REST APIs, JWT authentication, bcrypt password hashing, HTML/CSS/JavaScript frontend, JSON-file persistence.

## Run locally
1. Install Node.js (18+): https://nodejs.org/
2. Extract ZIP and open this folder in VS Code.
3. Open terminal in this folder and run `npm install`.
4. Copy `.env.example` to `.env` (`copy .env.example .env` in Windows CMD; `Copy-Item .env.example .env` in PowerShell).
5. Change `JWT_SECRET` in `.env` to a random secret of at least 32 characters.
6. Run `npm start`.
7. Open http://localhost:3000. Check http://localhost:3000/api/health.

## REST API endpoints
| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Check server |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/auth/me` | Bearer token | Get current user |
| GET | `/api/posts` | No | List all blog posts |
| GET | `/api/posts/mine` | Bearer token | List own posts |
| POST | `/api/posts` | Bearer token | Create blog post |
| DELETE | `/api/posts/:id` | Bearer token | Delete own post |

### Example JSON to register
`{"name":"Alex Morgan","email":"alex@example.com","password":"example-pass-123"}`

### Example JSON to create a post
`{"title":"My First Blog","category":"Learning","excerpt":"A short description of this story.","content":"This is a longer blog post with at least thirty characters."}`

## Deliverables checklist
- [ ] Start server and check `/api/health`
- [ ] Test registration and login
- [ ] Create a post and verify it appears on the homepage
- [ ] Confirm dashboard lists your posts
- [ ] Delete a post and test invalid login
- [ ] Upload code to GitHub
- [ ] Share project on LinkedIn with your actual repository link

## Important
This is a learning project. Data is stored in JSON files, so it is not designed for concurrent/production use. Passwords are hashed with bcrypt. JWT is stored in localStorage for this exercise; production applications should consider secure cookie-based sessions, rate limiting, HTTPS, database storage, and stronger deployment practices. Never use a real password in a demo.
