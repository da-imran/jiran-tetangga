# 🏡 JiranTetangga

A full-stack project designed to help residents of a dense neighbourhood in **Sungai Tiram, Penang** stay informed about local updates and report issues. This repository is the backend part of the whole project and built with Node.js.

## 🚀 Features

- 📢 Get real-time updates on:
  - Road disruptions
  - Local events and ceremonies
  - Shop openings and closures
  - Park conditions
- 📬 Residents can report damages or concerns
- 🧠 Admin system for managing updates and users
- 🤖 Discord Webhook Notifications
- 🐳 Docker support + local and cloud deployment ready

---

## 🛠️ Technologies Used

| Layer        | Tech Stack           |
|--------------|----------------------|
| Frontend     | TypeScript, NextJS, Tailwind CSS, Next.js (via Firebase 🔥)   |
| Backend      | Node.js + Express    |
| Database     | MongoDB              |
| Auth         | AES / JWT |
| Notification | Discord Webhook	|
| Container    | Docker, Docker Compose |
| CI/CD Pipeline  | Github Action     |
| Testing      | Chai / Sinon / Mocha	|

---

## 📂 Backend Project Structure
```bash
jiran-tetangga/
├── middleware/        # Middleware
│   ├── authentication.js   # Authentication controller
│   └── apiCheck.js   # Api key check for protected routes
├── modules/           # All feature-based route controllers
│   ├── adminUser.js   # Admin auth, create/read admins
│   ├── reports.js     # Issues reporting (e.g. pothole, accidents)
│   ├── disruptions.js # Road disruptions
│   ├── events.js      # Family events, ceremonies
│   ├── shops.js       # Shop status, new openings/closures
│   └── parks.js       # Park conditions, usage
├── nginx/
│   └── nginx.conf     # Nginx configuration
├── utilities/
│   ├── jwt.js         # JWT setup
│   ├── mongodb.js     # Central DB connection logic
│   ├── validation.js  # Parameters check function
│   └── secrets.js     # Secrets functions with Infisical
├── test/
│   ├── test.js        # Central place for backend API tests
│   ├── testIndex.js   # Serve as the index file for backend API tests
│   └── testServer.js  # Serve as the server for backend API tests
├── swagger/
│   ├── swagger-base.js     # Base configuration for Swagger
│   ├── swagger-output.js   # Swagger output documentation
│   └── swagger.js          # Main Swagger configuration file
├── .env               # Sensitive config (PORT, DB_URL)
├── app.js             # Express app, middleware, routes entry
├── server.js          # Separate boot file
├── index.js           # Index file
├── package.json       # Package JSON file
├── Dockerfile         # Docker configuration
├── docker-compose.yaml   # Docker yaml configuration
└── introduction.html   # Github HTML preview
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
HOSTNAME='localhost'
ROUTE_PREPEND = 'jiran-tetangga'
API_VERSION = '1.0.0'
APP_VERSION = '1.0.0'
VERSION = 'v1'
PORT=your_port_number
MONGODB_URI=mongodb_db_connection_uri
MONGODB_DBNAME=mongodb_name
ENCRYPTION_KEY=any random strings
API_KEY =any random strings
JWT_KEY = any random strings
NODE_ENV='local' # For env when running npm run dev / npm start
MONGO_URI='mongodb://localhost:27017/' # Default MongoDB localhost URI
INFISICAL_URI=http://localhost:85 # Set to 85 due to my port 80 being used
INFISICAL_PROJECT_ID='your infisical project id'
INFISICAL_CLIENT_ID='your infisical client id'
INFISICAL_CLIENT_SECRET='your infisical client secret'
INFISICAL_ENV=dev
```
<i>Sensitive information such as API_KEY, ENCRYPTION_KEY can be store using the Infisical secrets tools or you can just use any string for testing purposes</i>

### 4. Run Locally
```bash
npm start
```

### 5. Access API Documentation
The API documentation is available through Swagger UI. After starting the server:

1. For local development:
   ```
   http://localhost:{your_port_number}/{ROUTE_PREPEND}/{VERSION}/api-docs
   ```
   Example: `http://localhost:3000/jiran-tetangga/v1/api-docs`

2. Authentication Required:
   - Add the `x-api-key` header with your API key
   - API key should match the `API_KEY` in your environment variables
   - Example using cURL:
     ```bash
     curl -H "x-api-key: your_api_key" http://localhost:3000/jiran-tetangga/v1/api-docs
     ```

2. Features in the API documentation:
   - Detailed endpoint descriptions
   - Request/response schemas
   - Try-out functionality
   - Grouped endpoints by:
     - Admin Users
     - Events
     - Disruptions
     - Parks
     - Shops
     - Reports

3. Development Mode
   ```bash
   npm run dev
   ```
   Run in development mode to automatically update the API documentation when changes are made.

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
[x] CI/CD pipeline with Github Action </br>
[x] Discord webhook notification </br>

## 🤝 Contributing
This project is currently my second personal hobby project. Contributions and suggestions are welcome! Feel free to fork or open issues.

## 📜 License
This project is open-sourced under the MIT License.
