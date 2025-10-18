# SkillConnect ✨

SkillConnect is a hyperlocal platform designed to connect individuals within a community. Users can post tasks they need help with, allowing skilled providers in their vicinity to bid on them. Alternatively, users can browse and instantly book pre-defined services offered by local providers.

The platform facilitates communication through real-time chat, manages secure payments via Stripe, and keeps users informed with push notifications.

---

## 🚀 Features

* **Task Posting & Bidding:** Users can post tasks with descriptions, budgets, and locations. Local providers can view and bid on these tasks.
* **Instant Service Booking:** Providers can list fixed-price services (like lawn mowing, tutoring) that users can book directly.
* **Geospatial Search:** Find tasks and services within a specific radius using latitude and longitude.
* **User Profiles & Ratings:** Users have profiles displaying skills, bio, portfolio images, and an average rating based on completed tasks/services.
* **Secure Payments:** Integration with Stripe for handling payments for both bid-based tasks and instant bookings. Supports Card payments and Cash agreements. Payouts for providers via Stripe Express accounts.
* **Real-time Chat:** Integrated chat functionality (using Socket.IO) between task seekers and assigned providers for communication related to ongoing tasks.
* **Notifications:** Real-time (Socket.IO) and push notifications (Firebase Cloud Messaging) for events like new bids, new messages, task assignments, and task completion statuses.
* **Dashboard:** Centralized view for users to manage posted tasks, booked services, assigned jobs, and offered services, along with a financial overview.

---

## 🛠️ Tech Stack

* **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Leaflet (for maps), Socket.IO Client, Stripe.js, Firebase Messaging
* **Backend:** Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JSON Web Tokens (JWT), Stripe SDK, Firebase Admin SDK (for FCM), Bcrypt.js
* **Database:** MongoDB (with Mongoose ODM)
* **Deployment (Example):** Docker, Nginx (for client static files)

---

## 🏁 Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn
* MongoDB (local instance or a cloud service like MongoDB Atlas)
* Git
* Stripe Account (for API keys)
* Firebase Project (for FCM and service account credentials)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd skill-connect
    ```

2.  **Install Server Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

4.  **Environment Variables:**
    * **Server:** Create a `.env` file in the `server` directory. See the **Environment Variables** section below for required variables.
    * **Client:** Create a `.env` file in the `client` directory. See the **Environment Variables** section below. *Crucially*, ensure your Firebase configuration exists in `client/src/firebase-config.ts` and the service worker `client/public/firebase-messaging-sw.js` is set up.

### Running Locally

1.  **Start the MongoDB server** (if running locally).
2.  **Start the Backend Server:**
    ```bash
    cd server
    npm run dev
    ```
    The server should start, typically on port 5000.
3.  **Start the Frontend Client:**
    ```bash
    cd ../client
    npm run dev
    ```
    The client development server should start, typically on port 3000.
4.  Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite).

---

## 🐳 Running with Docker

This project includes configuration for running both the client and server using Docker Compose.

1.  **Prerequisites:** Docker and Docker Compose installed.
2.  **Environment Variables:** Create a `.env` file in the **root** directory (alongside `docker-compose.yml`). Add all the necessary environment variables listed below (both server and client, **without** the `VITE_` prefix for client variables in this specific file). Docker Compose will automatically load this file.
    *Example `.env` in root:*
    ```
    MONGO_URI=mongodb://mongo:2017/skillconnect
    JWT_SECRET=yoursecret
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    GOOGLE_APPLICATION_CREDENTIALS=./server/config/firebase-service-account.json # Relative path to creds
    API_URL=http://server:5000/api # Used by client build
    STRIPE_KEY=pk_test_... # Used by client build
    # ... other variables ...
    ```
3.  **Build the images:**
    ```bash
    docker compose build
    ```
4.  **Start the containers:**
    ```bash
    docker compose up
    ```
    Add `-d` to run in detached mode.
5.  Access the application at `http://localhost:3000`.

---

## ⚙️ Environment Variables

### Server (`server/.env`)