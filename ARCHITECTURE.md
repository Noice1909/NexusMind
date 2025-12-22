# 🏗️ NexusMind Architecture

**System Design & Technical Architecture**

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Design](#api-design)
7. [Security Architecture](#security-architecture)
8. [PWA Architecture](#pwa-architecture)
9. [AI Integration](#ai-integration)
10. [Deployment Architecture](#deployment-architecture)

---

## 🎯 System Overview

NexusMind is a full-stack Progressive Web Application (PWA) built with:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **AI:** Ollama (local) / Gemini API (cloud)
- **Deployment:** Vercel (frontend) + Railway (backend)

### **Key Characteristics:**
- **Serverless-ready** - Stateless backend, scales horizontally
- **Offline-first** - PWA with service worker caching
- **Real-time** - Optimistic UI updates
- **Secure** - Row-Level Security (RLS) + JWT auth
- **AI-powered** - Optional AI features for enhancement

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Desktop    │  │    Mobile    │      │
│  │   (Chrome)   │  │   (PWA)      │  │   (PWA)      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┴──────────────────┘              │
│                            │                                  │
│                   ┌────────▼────────┐                        │
│                   │  Service Worker │                        │
│                   │  (Offline Cache)│                        │
│                   └────────┬────────┘                        │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                      FRONTEND LAYER                            │
├───────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │  │
│  │  │  Pages   │  │Components│  │ Contexts │  │  Hooks  │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              API Client (Axios)                   │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                       BACKEND LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              FastAPI Application                           │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   Auth   │  │  Notes   │  │ Folders  │  │    AI    │  │  │
│  │  │   API    │  │   API    │  │   API    │  │   API    │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                                             │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │           Middleware (CORS, Auth, Logging)         │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │  │
│  │  │   Core   │  │ Services │  │    DB    │                │  │
│  │  │  (Auth)  │  │   (AI)   │  │  Client  │                │  │
│  │  └──────────┘  └──────────┘  └──────────┘                │  │
│  │                                                             │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────┬───────────────────────┬───────────────────────┘
                    │                       │
                    │                       │
         ┌──────────▼──────────┐  ┌────────▼────────┐
         │   Supabase          │  │   AI Service    │
         │   (PostgreSQL)      │  │   (Ollama/      │
         │   + Auth            │  │    Gemini)      │
         └─────────────────────┘  └─────────────────┘
```

---

## 🎨 Frontend Architecture

### **Technology Stack**
- **React 18.2** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Fuse.js** - Fuzzy search
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### **Component Hierarchy**

```
App
├── AuthContext (Authentication state)
├── ThemeContext (Dark mode)
└── Router
    ├── LoginPage
    ├── SignupPage
    ├── DashboardPage
    │   ├── Sidebar
    │   │   ├── SearchBar
    │   │   ├── FolderTree
    │   │   ├── TagFilter
    │   │   └── NoteList
    │   └── NoteEditor
    │       ├── TagInput
    │       ├── FolderSelector
    │       ├── AIMenu
    │       └── MarkdownEditor
    ├── ProfilePage
    └── GraphViewPage
```

### **State Management**

**Context API:**
- `AuthContext` - User authentication state
- `ThemeContext` - Dark mode preference

**Local State:**
- Component-level state with `useState`
- Side effects with `useEffect`
- Custom hooks for reusable logic

**Data Flow:**
```
User Action → Component Handler → API Call → Update State → Re-render
```

### **PWA Features**

**Service Worker:**
```javascript
// Caching strategy
- Cache-first: Static assets (HTML, CSS, JS)
- Network-first: API calls (with fallback)
- Background sync: Offline changes
```

**Manifest:**
- App name, icons, theme colors
- Display mode: standalone
- Start URL: /dashboard

---

## ⚙️ Backend Architecture

### **Technology Stack**
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Supabase Client** - Database & auth
- **Pydantic** - Data validation
- **Python-Jose** - JWT handling

### **API Structure**

```
backend/
├── api/
│   ├── auth.py       # POST /auth/signup, /auth/login
│   ├── notes.py      # CRUD /notes/
│   ├── folders.py    # CRUD /folders/
│   └── ai.py         # POST /ai/generate-tags, /ai/summarize
├── core/
│   ├── auth.py       # JWT utilities
│   ├── config.py     # Environment config
│   └── database.py   # Supabase client
├── services/
│   └── ai_service.py # AI integration
└── main.py           # App initialization
```

### **Request Flow**

```
1. Client Request → FastAPI Router
2. Middleware (CORS, Auth)
3. Route Handler
4. Validate Request (Pydantic)
5. Business Logic
6. Database Query (Supabase)
7. Response (JSON)
```

### **Authentication Flow**

```
1. User submits credentials
2. Backend validates with Supabase Auth
3. Supabase returns JWT token
4. Backend returns token to client
5. Client stores token in localStorage
6. Client includes token in Authorization header
7. Backend validates token on each request
```

---

## 🗄️ Database Schema

### **Tables**

#### **notes**
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    tags TEXT[],  -- Array of tags
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_folder_id ON notes(folder_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

#### **folders**
```sql
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📁',
    color TEXT DEFAULT '#8b5cf6',
    parent_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent ON folders(parent_folder_id);
```

### **Row-Level Security (RLS)**

```sql
-- Notes: Users can only access their own notes
CREATE POLICY "Users can view own notes"
    ON notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
    ON notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
    ON notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
    ON notes FOR DELETE
    USING (auth.uid() = user_id);

-- Similar policies for folders
```

---

## 🔌 API Design

### **RESTful Endpoints**

#### **Authentication**
```
POST   /auth/signup          # Create account
POST   /auth/login           # Login
POST   /auth/logout          # Logout
POST   /auth/reset-password  # Request password reset
```

#### **Notes**
```
GET    /notes/               # List all notes
POST   /notes/               # Create note
GET    /notes/{id}           # Get note
PUT    /notes/{id}           # Update note
DELETE /notes/{id}           # Delete note
GET    /notes/tags/all       # Get all tags
```

#### **Folders**
```
GET    /folders/             # List folders
POST   /folders/             # Create folder
GET    /folders/{id}         # Get folder
PUT    /folders/{id}         # Update folder
DELETE /folders/{id}         # Delete folder
GET    /folders/hierarchy    # Get folder tree
GET    /folders/{id}/notes   # Get notes in folder
```

#### **AI**
```
POST   /ai/generate-tags     # Generate tags for note
POST   /ai/summarize         # Summarize note
POST   /ai/enhance           # Enhance writing
POST   /ai/translate         # Translate note
```

### **Request/Response Format**

**Request:**
```json
{
  "title": "Meeting Notes",
  "body": "Discussion about project timeline...",
  "tags": ["work", "meeting"],
  "folder_id": "uuid-here"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Meeting Notes",
  "body": "Discussion about project timeline...",
  "tags": ["work", "meeting"],
  "folder_id": "uuid-here",
  "created_at": "2025-12-22T10:00:00Z",
  "updated_at": "2025-12-22T10:00:00Z"
}
```

---

## 🔒 Security Architecture

### **Authentication**
- **Supabase Auth** - Handles user management
- **JWT Tokens** - Stateless authentication
- **HTTP-only cookies** - Optional for enhanced security
- **Password hashing** - bcrypt with salt

### **Authorization**
- **Row-Level Security (RLS)** - Database-level access control
- **JWT validation** - Every API request
- **User context** - auth.uid() in RLS policies

### **Data Protection**
- **HTTPS only** - Encrypted in transit
- **Environment variables** - Secrets not in code
- **CORS** - Restricted origins
- **Rate limiting** - Prevent abuse (coming soon)

### **Security Headers**
```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## 📱 PWA Architecture

### **Service Worker Strategy**

```javascript
// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// Network-first for API calls
if (event.request.url.includes('/api/')) {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
}
```

### **Offline Support**

**IndexedDB:**
- Store pending changes when offline
- Sync when connection restored
- Conflict resolution (last-write-wins)

**Background Sync:**
```javascript
// Register sync
navigator.serviceWorker.ready.then(registration => {
  registration.sync.register('sync-notes');
});

// Handle sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncPendingChanges());
  }
});
```

---

## 🤖 AI Integration

### **Architecture**

```
Client Request
    ↓
FastAPI Endpoint
    ↓
AI Service Layer
    ↓
┌─────────────┬─────────────┐
│   Ollama    │   Gemini    │
│   (Local)   │   (Cloud)   │
└─────────────┴─────────────┘
```

### **Ollama Integration**
```python
async def generate_tags(title: str, content: str):
    response = await ollama.generate(
        model="llama3.1:8b",
        prompt=f"Generate tags for: {title}\n{content}"
    )
    return parse_tags(response)
```

### **Gemini Integration**
```python
async def generate_tags(title: str, content: str):
    response = await genai.generate_content(
        prompt=f"Generate tags for: {title}\n{content}"
    )
    return parse_tags(response.text)
```

---

## 🚀 Deployment Architecture

### **Production Setup**

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│  - React app (static files)             │
│  - Edge CDN (global)                    │
│  - Auto HTTPS                           │
│  - Preview deployments                  │
└──────────────┬──────────────────────────┘
               │
               │ HTTPS API calls
               │
┌──────────────▼──────────────────────────┐
│       Railway (Backend)                 │
│  - FastAPI app                          │
│  - Auto-scaling                         │
│  - Health checks                        │
│  - Environment variables                │
└──────────────┬──────────────────────────┘
               │
               │ PostgreSQL connection
               │
┌──────────────▼──────────────────────────┐
│         Supabase                        │
│  - PostgreSQL database                  │
│  - Authentication                       │
│  - Row-Level Security                   │
│  - Automatic backups                    │
└─────────────────────────────────────────┘
```

### **Scaling Strategy**

**Frontend (Vercel):**
- Static files on CDN
- Infinite scale
- Edge caching

**Backend (Railway):**
- Horizontal scaling
- Auto-scaling based on load
- Health check endpoints

**Database (Supabase):**
- Connection pooling
- Read replicas (Pro plan)
- Automatic backups

---

## 📊 Performance Optimizations

### **Frontend**
- **Code splitting** - Lazy load routes
- **Image optimization** - WebP format
- **Bundle size** - Tree shaking, minification
- **Caching** - Service worker cache
- **Virtual scrolling** - Large note lists

### **Backend**
- **Connection pooling** - Reuse DB connections
- **Query optimization** - Indexes on common queries
- **Caching** - Redis for frequent queries (future)
- **Async operations** - Non-blocking I/O

### **Database**
- **Indexes** - user_id, created_at, tags (GIN)
- **Query limits** - Pagination
- **RLS optimization** - Efficient policies

---

## 🔄 Data Flow Examples

### **Creating a Note**

```
1. User types in editor
2. Auto-save triggers after 3s
3. Frontend: POST /notes/ with data
4. Backend: Validate JWT token
5. Backend: Validate request data
6. Backend: Insert into Supabase
7. Supabase: Check RLS policy
8. Supabase: Insert row
9. Backend: Return created note
10. Frontend: Update UI optimistically
```

### **Offline Sync**

```
1. User creates note while offline
2. Store in IndexedDB
3. Show "Offline" indicator
4. Connection restored
5. Service worker triggers sync
6. POST pending changes to API
7. Update IndexedDB with server IDs
8. Show "Synced" indicator
```

---

## 🎯 Future Architecture Enhancements

### **Planned Improvements**
- **Real-time collaboration** - WebSockets for live editing
- **Redis caching** - Faster API responses
- **CDN for assets** - Cloudflare for images
- **Elasticsearch** - Advanced full-text search
- **GraphQL** - Alternative to REST API
- **Microservices** - Separate AI service

---

**Architecture Version:** 1.0.0  
**Last Updated:** December 22, 2025
