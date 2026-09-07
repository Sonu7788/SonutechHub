# ☕ SonuTechHub - Java DSA Practice Platform & Online Compiler

A production-grade **MERN** (MongoDB, Express, React, Node.js) platform for structured **Java Data Structures & Algorithms (DSA)** practice, featuring an **integrated real-time Java OpenJDK 24 compiler/runner**, **category-based tracks**, and a full-featured **Admin Panel with Excel/CSV bulk question upload and user management**.

---

## 🌟 Key Features

### 1. 📂 Category-Based DSA Tracks
- Categorized problem tracks: **Arrays**, **Strings**, **Linked Lists**, **Stack & Queue**, **Binary Search**, **Trees & BST**, **Dynamic Programming**, **Graphs**.
- Difficulty filters (**Easy**, **Medium**, **Hard**), topic filtering, search, and solved progress markers.
- Problem detail views with input/output format specifications, examples, constraints, and hints.

### 2. ⚡ Integrated Java 24 Compiler & Sandbox
- **Monaco Editor** (VS Code engine) with full Java syntax highlighting, auto-formatting, and indentation.
- **Run Code**: Compiles and executes Java code against sample test cases or custom `stdin` in milliseconds.
- **Submit Solution**: Evaluates code against full test suites (including hidden test cases), checks outputs with whitespace normalization, enforces execution timeouts, and triggers celebratory confetti upon acceptance.
- **Progress Auto-Save**: Auto-saves student code drafts on run/submit and restores their exact code upon re-opening problems.

### 3. 🛡️ Comprehensive Admin Dashboard
- **Question Management**: Create, edit, and delete questions with clean starter boilerplates, test suites (visible/hidden), hints, and constraints.
- **User & Student Management**:
  - View all registered student accounts and their solved question counts.
  - **Edit Account Credentials**: Change student names, emails, and reset user passwords.
  - **Block / Unblock Students**: Temporarily suspend or reinstate student access to practice and code testing.
  - **Inspect User Progress & Code**: Inspect each student's solved questions and review their actual submitted Java solutions.
- **Bulk Excel/CSV Question Importer**:
  - Drag & drop `.xlsx`, `.xls`, or `.csv` spreadsheets.
  - Download pre-formatted Excel template (`dsa_questions_template.xlsx`).
  - Automated column parsing, category matching, and multiple test case ingestion.
- **Live Analytics**: Overview of registered users, question bank count, submissions stream, and overall acceptance rate.

### 4. 👤 Student Dashboard & Stats
- Track total solved questions with **Easy / Medium / Hard** progress bars.
- Live submission history with status, execution time, and expandable Java code viewer.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18+)
- **JDK (Java Development Kit)** (Java 17, 21, or 24 with `javac` and `java` available in system PATH)
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017/javadsa` or MongoDB Atlas URI)

### Installation & Startup

1. **Configure MongoDB URI** in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/javadsa
   JWT_SECRET=javadsa_secret_key_2026_super_secure_jwt
   NODE_ENV=development
   ```

2. **Start SonuTechHub Platform**:
   ```bash
   npm run dev
   ```

   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Default Demo Credentials

The database seeds initial admin and student accounts automatically on startup:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@javadsa.com` | `admin123` | Full Question CRUD, Category Manager, User Management (Password/Block), Excel Bulk Upload |
| **Student** | `student@javadsa.com` | `student123` | Solve questions, Monaco editor, Run/Submit code, View Profile Stats |

*(You can also use the 1-click Demo buttons on the `/login` page).*
