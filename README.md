# 🏡 Neighbourhood Info System

A full-stack project designed to help residents of a dense neighbourhood in **Sungai Tiram, Penang** stay informed about local updates, report issues, and stay connected through a WhatsApp-integrated system.

## 🚀 Features

- 📢 Get real-time updates on:
  - Road disruptions
  - Local events or ceremonies
  - Shop openings or closures
  - Park conditions
- 📬 Residents can report damages or concerns
- 🧠 Admin system for managing updates and users
- 🤖 WhatsApp bot integration
- 🌐 React frontend + Node.js backend + MongoDB
- 🐳 Docker support + local and cloud deployment ready

---

## 🛠️ Technologies Used

| Layer        | Tech Stack           |
|--------------|----------------------|
| Frontend     | React.js (planned)   |
| Backend      | Node.js + Express    |
| Database     | MongoDB              |
| Auth         | Encrypted password storage (AES) |
| Messaging    | WhatsApp Bot	|
| Container    | Docker, Docker Compose |
| Orchestration| Kubernetes (local + cloud) |
| CI/CD        | GitLab Pipelines     |
| Monitoring   | Prometheus + Grafana |
| Testing      | Jest / Mocha	|

---

## 📂 Backend Project Structure

neighborhood-system/
├── modules/           # All feature-based route controllers
│   ├── adminUser.js   # Admin auth, create/read admins
│   ├── reports.js     # Issue reporting (e.g. pothole, disruption)
│   ├── residents.js   # Resident info (optional user profiles)
│   ├── updates.js     # News, announcements
│   ├── events.js      # Family events, ceremonies
│   ├── shops.js       # Shop status, new openings/closures
│   ├── parks.js       # Park conditions, usage
├── utilities/
│   └── mongodb.js     # Central DB connection logic
├── test/
│   └── test.js        # Central place for backend API tests
├── .env               # Sensitive config (PORT, DB_URL)
├── app.js             # Express app, middleware, routes entry
├── server.js          # Separate boot file (optional)
├── package.json

---

## ⚙️ Getting Started

### 1. Clone the project

```bash
git clone https://github.com/da-imran/neighborhood-system.git
cd neighbourhood-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a .env file

PORT=your_port_number </br>
MONGODB_URI=mongodb_db_connection_uri </br>
MONGODB_DBNAME=mongodb_name </br>
MONGODB_COLLECTION=mongodb_collection </br>
ENCRYPTION_KEY=encryption_secret_key </br>

### 4. Run Locally
```bash
npm run dev
```

## 📦 Docker Support 
(Coming soon in Phase 3)

## 📌 Roadmap 
[x] Admin user creation API </br>
[x] MongoDB connection setup </br>
[x] Reversible password encryption </br>
[x] Modular Express routing </br>
[] WhatsApp bot notification </br>
[] CI/CD pipeline with GitLab </br>
[] Kubernetes orchestration </br>
[] React frontend dashboard </br>

## 🤝 Contributing
This project is currently my second personal hobby project. Contributions and suggestions are welcome! Feel free to fork or open issues.

## 📜 License
This project is open-sourced under the MIT License.