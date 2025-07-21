# 🏡 JiranTetangga

A full-stack project designed to help residents of a dense neighbourhood in **Sungai Tiram, Penang** stay informed about local updates, report issues, and stay connected through a WhatsApp-integrated system.

## 🚀 Features

- 📢 Get real-time updates on:
  - Road disruptions
  - Local events and ceremonies
  - Shop openings and closures
  - Park conditions
- 📬 Residents can report damages or concerns
- 🧠 Admin system for managing updates and users
- 🤖 WhatsApp bot integration
- 🐳 Docker support + local and cloud deployment ready

---

## 🛠️ Technologies Used

| Layer        | Tech Stack           |
|--------------|----------------------|
| Frontend     | TypeScript, NextJS, Tailwind CSS, Next.js (via Firebase 🔥)   |
| Backend      | Node.js + Express    |
| Database     | MongoDB              |
| Auth         | AES / JWT |
| Messaging    | WhatsApp Bot	|
| Container    | Docker, Docker Compose |
| CI Pipeline  | Github Action     |
| Testing      | Chai / Sinon / Mocha	|

---

## 📂 Backend Project Structure
```bash
jiran-tetangga/
├── middleware/                 # Middleware
│   ├── authentication.js       # Authentication controller
├── modules/                    # All feature-based route controllers
│   ├── adminUser.js            # Admin auth, create/read admins
│   ├── reports.js              # Issues reporting (e.g. pothole, accidents)
│   ├── disruptions.js          # Road disruptions
│   ├── events.js               # Family events, ceremonies
│   ├── shops.js                # Shop status, new openings/closures
│   └── parks.js                # Park conditions, usage
├── utilities/
│   ├── jwt.js                  # JWT setup
│   ├── mongodb.js              # Central DB connection logic
│   └── validation.js           # Parameters check function
├── test/
│   └── test.js                 # Central place for backend API tests
├── .env                        # Sensitive config (PORT, DB_URL)
├── app.js                      # Express app, middleware, routes entry
├── server.js                   # Separate boot file
├── index.js                    # Index file
├── package.json                # Package JSON file
├── Dockerfile                  # Docker configuration
├── docker-compose.yaml         # Docker yaml configuration
├── .postaman_collection.json   # Postman collection
```

---

## ⚙️ Getting Started

### 1. Clone the project

```bash
git clone https://github.com/da-imran/jiran-tetangga.git
cd jiran-tetangga
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a .env file
```bash
PORT=your_port_number
MONGODB_URI=mongodb_db_connection_uri
MONGODB_DBNAME=mongodb_name
ROUTE_PREPEND = 'jiran-tetangga'
API_VERSION = '1.0.0'
APP_VERSION = '1.0.0'
VERSION = 'v1'
ENCRYPTION_KEY=any random strings
API_KEY =any random strings
JWT_KEY = any random strings
RUN_ENV='local'
```

### 4. Run Locally
```bash
npm run dev
```

## 📦 Docker Support 
1.  Docker support has been built into the project
2.  Contains `Dockerfile` and `docker-compose.yaml` for the Docker configurations
3.  Can easily run command `docker compose up --build -d` in CLI to start up the project
4.  **Requirement:** Docker

## 📌 Roadmap 
[x] Admin user creation API </br>
[x] MongoDB connection setup </br>
[x] Reversible password encryption </br>
[x] Modular Express routing </br>
[x] NextJS frontend dashboard </br>
[] WhatsApp bot notification </br>
[x] CI pipeline with Github Action </br>

## 🤝 Contributing
This project is currently my second personal hobby project. Contributions and suggestions are welcome! Feel free to fork or open issues.

## 📜 License
This project is open-sourced under the MIT License.
