# OpsMind AI - Frontend (React + Vite) 🎨

The highly interactive portal for the OpsMind AI Agent. Designed with a focus on visual excellence, security, and real-time performance.

## 🚀 Key Features
- **Architecture 3.0**: Refactored for modularity with specialized atomic components (`UserTable`, `SopTable`, `CustomDropdown`) and custom hooks.
- **Premium Aesthetics**: Interactive cursor spotlight, smooth gradients, and micro-animations for an enterprise-grade experience.
- **Live AI Streaming**: Real-time token rendering for fluid conversational interactions.
- **Dynamic Admin Dashboard**: Real-time user management and SOP access control toggles.
- **Subscription Management**: Internal portal for users to manage their organizational tiers.
- **Production Guard**: Multi-stage Docker build powered by Nginx for high-scale document serving.


---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `Frontend/` folder:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

---

## 🏗️ Technical Highlights
- **Vite 7**: Ultra-fast build toolchain.
- **Tailwind CSS**: Utility-first styling with modern design tokens.
- **Hooks-based State**: Clean separation of concerns between UI and logic.
- **Nginx Config**: Custom `nginx.conf` included for robust routing in production environments.

## 🌐 Live Preview
Visit the live application: [Enterprise SOP Agent on Render](https://enterprise-sop-agent-frontend.onrender.com/)

---
*OpsMind AI – Empowering enterprise knowledge with AI*