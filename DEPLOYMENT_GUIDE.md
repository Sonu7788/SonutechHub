# 🚀 SonuTechHub Deployment Guide

SonuTechHub includes an integrated **Java 24 / 21 compiler sandbox**, which means the host environment requires both **Node.js** and **OpenJDK (`javac` and `java`)**.

Below are the 3 easiest and recommended deployment methods:

---

## 🌟 Method 1: 1-Click Free Cloud Deployment on Render (Recommended)

[Render](https://render.com) offers free Docker web service hosting that automatically builds our `Dockerfile` with Node.js and OpenJDK.

### Steps:
1. **Push your code to GitHub / GitLab**:
   ```bash
   git init
   git add .
   git commit -m "SonuTechHub Java DSA Platform"
   git remote add origin https://github.com/your-username/sonutechhub.git
   git push -u origin main
   ```

2. **Create a Free MongoDB Database**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (Free tier).
   - Create a free Shared Cluster (M0).
   - Under **Database Access**, create a database user and password.
   - Under **Network Access**, add IP `0.0.0.0/0` (Allow from anywhere).
   - Click **Connect** -> **Drivers** and copy your `MONGO_URI` connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/sonutechhub?retryWrites=true&w=majority
     ```

3. **Deploy on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - Render will auto-detect the `Dockerfile` in root!
   - In **Environment Variables**, add:
     - `MONGO_URI` = *(your MongoDB Atlas URI)*
     - `JWT_SECRET` = *(any random secure 32-character string)*
     - `PORT` = `5000`
     - `NODE_ENV` = `production`
   - Click **Create Web Service**.
   - Render will build the container, install OpenJDK, build the frontend, and launch the platform at your custom `https://sonutechhub.onrender.com` URL!

---

## 🚂 Method 2: Deployment on Railway

[Railway](https://railway.app) provides native Docker support:

1. Create a new project on [Railway.app](https://railway.app).
2. Choose **Deploy from GitHub Repo**.
3. Railway automatically detects `Dockerfile`.
4. Add a MongoDB database plugin or set your `MONGO_URI` environment variable.
5. Click **Generate Domain** in service settings -> Done!

---

## 🐳 Method 3: Deploy Locally or on any VPS with Docker Compose

If you have Docker installed on your VPS (Ubuntu, Debian, AWS EC2, DigitalOcean):

1. Clone or copy the project folder to the server.
2. Run:
   ```bash
   docker-compose up -d --build
   ```
3. Your platform will be running on port `5000` with an isolated MongoDB container and persistent volume.

---

## 🧪 Verifying Production Health

Once deployed, test the health check endpoint:
```
GET https://your-deployed-domain.com/api/health
```
Response:
```json
{
  "status": "ok",
  "app": "SonuTechHub Java DSA Platform",
  "javaVersion": "Java 21/24",
  "database": "connected"
}
```
