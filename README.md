# 🧠 NexusMind

**A modern, intelligent note-taking application with AI-powered features, offline support, and advanced organization.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)](https://supabase.com/)

---

## ✨ Features

### 📝 **Core Note-Taking**
- ✅ Rich markdown editor with live preview
- ✅ Auto-save (3-second delay)
- ✅ Full-text search with fuzzy matching
- ✅ Favorites and archive system
- ✅ Note templates (Meeting, Todo, Journal, etc.)

### 🗂️ **Organization**
- ✅ **Folders** - Hierarchical organization with custom icons & colors
- ✅ **Tags** - Multi-tag support with autocomplete
- ✅ **Advanced Filtering** - Filter by folder, tags, word count, date
- ✅ **Recently Viewed** - Quick access to recent notes
- ✅ **Saved Searches** - Save frequent search queries

### 🤖 **AI Features** (Optional)
- ✅ AI-powered tag generation
- ✅ Note summarization
- ✅ Content enhancement
- ✅ Multi-language translation
- ✅ Powered by Ollama (local) or Gemini API

### 📱 **Progressive Web App (PWA)**
- ✅ Install as desktop/mobile app
- ✅ Offline functionality
- ✅ Background sync
- ✅ Push notifications ready
- ✅ Responsive design (mobile, tablet, desktop)

### 🔒 **Security**
- ✅ Secure authentication (Supabase Auth)
- ✅ Row-Level Security (RLS) policies
- ✅ JWT token-based API
- ✅ Password reset via email
- ✅ HTTPS ready

### 🎨 **User Experience**
- ✅ Beautiful glassmorphic UI
- ✅ Dark mode optimized
- ✅ Smooth animations
- ✅ Keyboard shortcuts (Ctrl+K search, Ctrl+N new note)
- ✅ Export notes (Markdown, TXT, PDF)

---

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/))
- **Supabase Account** ([Sign up free](https://supabase.com/))

### **1. Clone Repository**

```bash
git clone https://github.com/yourusername/nexusmind.git
cd nexusmind
```

### **2. Backend Setup**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run backend
python main.py
```

Backend will run on: **http://localhost:8000**

### **3. Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### **4. Database Setup**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor
4. Run migrations in order:
   - `backend/migrations/001_initial_schema.sql`
   - `backend/migrations/002_add_tags_and_folders.sql`

---

## 📦 Environment Variables

### **Backend (.env)**

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Secret (generate random string)
JWT_SECRET_KEY=your-random-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# AI Configuration (Optional)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### **Frontend (.env)**

```bash
VITE_API_URL=http://localhost:8000
```

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework:** React 18.2 with Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Markdown:** React Markdown with GFM
- **Search:** Fuse.js (fuzzy search)
- **Notifications:** React Hot Toast
- **PWA:** Vite PWA Plugin

### **Backend**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **AI:** Ollama / Google Gemini
- **Email:** SMTP (Gmail/SendGrid)

### **Infrastructure**
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Vercel (Frontend) + Railway/Render (Backend)
- **CDN:** Vercel Edge Network

---

## 📖 Documentation

- **[Architecture](./ARCHITECTURE.md)** - System design and architecture
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when backend is running)
- **[Deployment Guide](./VERCEL_DEPLOYMENT.md)** - Step-by-step deployment instructions

---

## 🎯 Project Structure

```
NexusMind/
├── backend/                 # FastAPI backend
│   ├── api/                # API endpoints
│   │   ├── auth.py        # Authentication
│   │   ├── notes.py       # Notes CRUD
│   │   ├── folders.py     # Folders management
│   │   └── ai.py          # AI features
│   ├── core/              # Core functionality
│   │   ├── auth.py        # Auth utilities
│   │   ├── database.py    # Database connection
│   │   └── config.py      # Configuration
│   ├── migrations/        # Database migrations
│   ├── services/          # External services
│   │   └── ai_service.py  # AI integration
│   └── main.py           # Application entry point
│
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilities and API client
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   └── index.html        # HTML entry point
│
└── README.md             # This file
```

---

## 🔑 Key Features Explained

### **Folders & Tags**
Organize notes with hierarchical folders and flexible tags:
- Create folders with custom icons (12 options) and colors (8 options)
- Add multiple tags to notes with autocomplete
- Filter notes by folder, tags, or both
- Drag-and-drop support (coming soon)

### **Advanced Search**
Powerful search capabilities:
- **Fuzzy matching** - Find notes even with typos
- **Multi-filter** - Combine folder, tags, word count, date filters
- **Saved searches** - Save frequently used search queries
- **Recently viewed** - Quick access to recent notes

### **PWA Features**
Works offline and installs like a native app:
- **Offline mode** - Access notes without internet
- **Background sync** - Syncs when connection returns
- **Install prompt** - Add to home screen
- **Update notifications** - Auto-updates when new version available

### **AI Integration**
Optional AI features powered by local Ollama or cloud Gemini:
- **Generate tags** - AI suggests relevant tags
- **Summarize** - Get quick summaries of long notes
- **Enhance** - Improve writing quality
- **Translate** - Multi-language support

---

## 🛠️ Development

### **Run Tests**

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### **Build for Production**

```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed, Python runs directly)
```

### **Code Quality**

```bash
# Frontend linting
npm run lint

# Backend formatting
black .
flake8 .
```

---

## 🚀 Deployment

### **Vercel (Frontend)**
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy automatically

### **Railway (Backend)**
1. Connect GitHub repository
2. Add environment variables
3. Deploy with one click

**See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.**

---

## 📊 Project Status

**Current Version:** 1.0.0  
**Completion:** 82%

### **Completed Features:**
- ✅ Core note-taking (100%)
- ✅ Authentication & security (100%)
- ✅ PWA support (100%)
- ✅ Tags & Folders (100%)
- ✅ Advanced search (100%)
- ✅ AI features (100%)
- ✅ Responsive design (100%)

### **In Progress:**
- ⏳ Rich text editor enhancements
- ⏳ Collaboration features
- ⏳ Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - Backend infrastructure
- **Vercel** - Frontend hosting
- **Ollama** - Local AI capabilities
- **Google Gemini** - Cloud AI features
- **Lucide** - Beautiful icons
- **Tailwind CSS** - Styling framework

---

## 📧 Contact

**Project Link:** [https://github.com/yourusername/nexusmind](https://github.com/yourusername/nexusmind)

**Live Demo:** [https://nexusmind.vercel.app](https://nexusmind.vercel.app) (coming soon)

---

## 🎉 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Note Editor
![Editor](./screenshots/editor.png)

### Folders & Tags
![Organization](./screenshots/folders-tags.png)

---

**Made with ❤️ by the NexusMind Team**
