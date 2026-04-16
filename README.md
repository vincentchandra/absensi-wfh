# Dexa Group - Fullstack WFH Attendance System

This repository contains the Fullstack Developer Skill Test assignment for Dexa Group. It is a completely modular HRIS Web Application focused on Work-From-Home employee attendance, equipped with role-based security barriers, automated database scaling, and photo capturing functionalities.

## 💻 Technology Stack

* **Backend**: Node.js & NestJS Framework (TypeScript)
* **Frontend**: React.js with Vite Build Tool
* **Database**: MySQL 8.0 (Dockerized) & TypeORM
* **Security & Auth**: Passport JWT, Bcrypt Password Hashing, CORS Protection
* **Storage Engine**: Multer (Local File Storage for attendance proofs)

---

## ⚙️ Prerequisites

To run this application properly on your local environment, ensure you have the following installed:
1. **Node.js** (v18.x or v20.x recommended)
2. **Docker Desktop** (to spin up the local MySQL container easily)
3. **Git** (optional, for cloning)

---

## 🚀 How to Run the Application

This is a Monorepo containing both Backend and Frontend folders. Please follow the steps sequentially.

### Step 1: Start the Database
The project utilizes `docker-compose` to instantly set up a MySQL database without messy local configurations.
1. Open a terminal at the root repository (`/dexa`).
2. Run the MySQL Docker container in the background:
   ```bash
   docker-compose up -d
   ```
   *(This will run a database instance named `dexa_attendance` accessible via `localhost:3306` with default credentials)*.

### Step 2: Configure & Start the Backend (NestJS)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Prepare Environment Variables. Duplicate the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(By default, `.env.example` is fully configured to immediately sync with the local Docker database out of the box).*
4. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   *(The backend server will automatically establish table synchronizations via TypeORM and will be alive on `http://localhost:3001`. A default Admin will be permanently seeded at startup).*

### Step 3: Configure & Start the Frontend (Vite/React)
Open a **NEW** separate terminal (keeping the Backend terminal alive).
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *(The progressive web app interface will be accessible globally via `http://localhost:5173`).*

---

## 🛂 Standard Default Credentials

A default Administrator account is robustly seeded into the DB upon the first NestJS execution startup. 

**Admin Role Panel**:
* **Username:** `admin`
* **Password:** `admin123`

You can log in as Admin, create a dummy employee format, and test the Role Barrier functionalities seamlessly using the employee's `NIP`. The default starting password universally given to any new employee account created stands to be `dexa2026`.

*(Note: Employees logging in for the first time will be forcefully directed to **Change Password Page**, acting as a Zero-Trust security compliance check).*

---

## 📸 Notes Evaluator

* **Photo Path Validations**: To ensure photos are correctly captured, the module `<input type="file" capture="environment">` is intentionally incorporated into the App Interface. This means opening the URL natively via a Mobile Smartphone browser will natively launch modern Mobile Camera Interfaces.
* **Storage Assets**: Clock-In images captured are permanently uploaded to `/backend/uploads/` directory, protected by MIME Type backend interceptors.
