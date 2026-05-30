# DevPulse

**Internal Tech Issue & Feature Tracker**  
A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

![DevPulse](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## Live Demo

**Backend URL:** `https://placeholder.com`

---

## Features

- User registration and authentication system
- JWT-based secure login flow
- Role-based access control (Contributor & Maintainer)
- Create bug reports and feature requests
- View all issues
- Update issue details with permission rules
- Delete issues (maintainer only)
- Secure password hashing using bcrypt
- Centralized global error handling
- Modular and scalable architecture
- PostgreSQL raw SQL integration (no ORM)

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- bcrypt
- JSON Web Token (JWT)
- Cookie Parser
- dotenv

---


## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Faisalm1400/DevPulse-L2A2.git
cd DevPulse-L2A2
npm install
```

## Environment Variables

```bash
PORT= "port"
BASE_URL= "base_url"
SECRET= "secret"
DATABASE_URL="database_url"
ACCESS_TIME= "access_time"
```


## API Endpoints

### Authentication
| Method | Endpoint              | Access         | Description             |
|--------|-----------------------|----------------|-------------------------|
| POST   | `/api/auth/signup`    | Public         | Register new user       |
| POST   | `/api/auth/login`     | Public         | Login & get JWT         |

### Issues
| Method | Endpoint               | Access                        | Description                  |
|--------|------------------------|-------------------------------|------------------------------|
| POST   | `/api/issues`          | Authenticated                 | Create new issue             |
| GET    | `/api/issues`          | Public                        | Get all issues (with filters)|
| GET    | `/api/issues/:id`      | Public                        | Get single issue             |
| PATCH  | `/api/issues/:id`      | Auth (contributor/Maintainer) | Update issue                 |
| DELETE | `/api/issues/:id`      | Maintainer only               | Delete issue                 |

---

## Database Schema

### 1. `users` Table
| Field       | Type          | Description                          |
|-------------|---------------|--------------------------------------|
| id          | SERIAL        | Primary Key                          |
| name        | VARCHAR(20)   | Full name                            |
| email       | VARCHAR(30)   | Unique email                         |
| password    | TEXT          | Hashed password                      |
| role        | VARCHAR(20)   | `contributor` or `maintainer`        |
| created_at  | TIMESTAMP     | Auto-generated                       |
| updated_at  | TIMESTAMP     | Auto-updated                         |

### 2. `issues` Table
| Field         | Type          | Description                          |
|---------------|---------------|--------------------------------------|
| id            | SERIAL        | Primary Key                          |
| title         | VARCHAR(150)  | Issue title                          |
| description   | TEXT          | Detailed description                 |
| type          | VARCHAR(20)   | `bug` or `feature_request`           |
| status        | VARCHAR(20)   | `open`, `in_progress`, `resolved`    |
| reporter_id   | INTEGER       | Reference to users.id                |
| created_at    | TIMESTAMP     | Auto-generated                       |
| updated_at    | TIMESTAMP     | Auto-updated                         |

---

