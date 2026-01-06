# OpsMind AI - Enterprise SOP Agent 🤖

An advanced, AI-powered knowledge management system for enterprise Standard Operating Procedures (SOPs). Transform your static PDFs into an interactive, conversational knowledge base with built-in security and scalability.

## 🚀 Key Features

*   **Premium Interactive UI**: Features a modern, Gemini-inspired dark mode with real-time cursor spotlight effects and high-end animations.
*   **Intelligent RAG Streaming**: Near-instant "typing" responses powered by Google Gemini and a high-performance Vector Search pipeline.
*   **Subscription Center**: Tiered plan management (Basic, Pro, Enterprise) for scaling organizational needs.
*   **Security-First Auth**: Comprehensive JWT-based authentication with Login/Signup flows and Role-Based Access Control (RBAC).
*   **System Admin Panel**: Full oversight of users and SOP documents with instant access toggles.
*   **Multi-Model Support**: Seamlessly switch between **OpsMind 4.0** (Gemini Pro), **4.2** (GPT-4), and **5.0** (Claude 3) capabilities.
*   **Production Ready**: Fully containerized with Docker and Nginx for seamless cloud deployment.

## 🛠️ Technology Stack

### Frontend
*   **React 19** (Vite + Architecture 2.0 with Custom Hooks)
*   **Tailwind CSS** + **Lucide Icons**
*   **Nginx** (Production server for optimized performance)

### Backend
*   **Node.js & Express v5**
*   **MongoDB Atlas** (Vector Search & Persistent Storage)
*   **Google Gemini AI** (Embeddings & Inference)
*   **JWT & Bcrypt** (Secure Authentication)

## 📦 Getting Started

### Option 1: Docker (Recommended)
The easiest way to run the entire stack:
1.  Ensure **Docker Desktop** is running.
2.  Run: `docker-compose up --build`
3.  Frontend: `http://localhost` | Backend: `http://localhost:5000`

### Option 2: Local Development
1.  **Backend**:
    ```bash
    cd Backend && npm install
    npm run dev # Port 5000
    ```
2.  **Frontend**:
    ```bash
    cd Frontend && npm install
    npm run dev # Port 5173
    ```

## 🚀 Deployment (Render/Cloud)
The project is configured for one-click deployment via Docker. Connect your repository to **Render**, set your Environment Variables (`MONGODB_URI`, `GEMINI_API_KEY`), and it will automatically build and deploy.

---
**Version**: 1.1.0 | *OpsMind AI – Empowering enterprise knowledge*
