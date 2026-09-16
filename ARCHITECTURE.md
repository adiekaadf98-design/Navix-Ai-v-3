# NAVIX AI MASTER ARCHITECTURE
*Complete System Overview Version 1.0 - Ultimate Edition*

## 1. STRUKTUR FOLDER LENGKAP
```
navix-ai/
├── src/
│   ├── backend/
│   │   ├── engines/
│   │   │   ├── SecurityShield.ts      (Rate limit, JWT, input validation)
│   │   │   ├── AIRouter.ts            (Model selection, load balancing)
│   │   │   ├── ThinkingEngine.ts      (Intent detection, step planner)
│   │   │   ├── VerificationEngine.ts  (Fact check, source check, safety)
│   │   │   ├── MemoryEngine.ts        (PostgreSQL + Pinecone integration)
│   │   │   ├── KnowledgeEngine.ts     (RAG, Vector search, documents)
│   │   │   ├── SearchEngine.ts        (Web search, DB search, file search)
│   │   │   ├── CreativeEngine.ts      (Image, Video, Audio generation)
│   │   │   ├── BusinessEngine.ts      (Analytics, CRM, Automation)
│   │   │   ├── FileEngine.ts          (S3/Cloud storage integration)
│   │   │   └── TaskEngine.ts          (Background jobs, scheduling)
│   │   ├── database/
│   │   │   ├── pg-client.ts           (PostgreSQL real connection pool)
│   │   │   ├── redis-client.ts        (Redis caching layer)
│   │   │   └── pinecone-client.ts     (Pinecone Vector DB connection)
│   │   ├── middleware/
│   │   │   ├── auth.ts                (JWT validation)
│   │   │   └── errorHandler.ts        (Global error handling)
│   │   └── utils/
│   │       └── logger.ts              (Winston real-time logging)
│   ├── components/                    (Frontend React components)
│   ├── services/                      (Frontend API clients)
│   ├── types/                         (Shared TypeScript interfaces)
│   ├── App.tsx                        (Frontend entry point)
│   └── main.tsx
├── server.ts                          (Backend API Gateway & Express Server)
├── Dockerfile                         (Containerization)
├── docker-compose.yml                 (Local infrastructure)
└── package.json
```

## 2. DATABASE SCHEMA (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memories Table (Structured Data)
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    importance INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 3. ENTITY RELATIONSHIP DIAGRAM
```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ MEMORIES : owns
    SESSIONS ||--o{ MESSAGES : contains
    USERS {
        uuid id PK
        string email
        string password_hash
        string role
    }
    SESSIONS {
        uuid id PK
        uuid user_id FK
        string title
        datetime created_at
    }
    MESSAGES {
        uuid id PK
        uuid session_id FK
        string role
        text content
    }
    MEMORIES {
        uuid id PK
        uuid user_id FK
        string type
        text content
    }
```

## 4. WORKFLOW & ENGINE FLOWS

### API Gateway & Security Flow
```mermaid
sequenceDiagram
    participant User
    participant Gateway as API Gateway (server.ts)
    participant Shield as Security Shield
    participant Auth as Auth Middleware

    User->>Gateway: POST /api/chat
    Gateway->>Shield: Validate IP & Rate Limit
    Shield-->>Gateway: OK
    Gateway->>Auth: Validate JWT Token
    Auth-->>Gateway: Token Valid
    Gateway->>Router: Forward Request
```

### AI Router & Thinking Flow
```mermaid
sequenceDiagram
    participant Router as AI Router
    participant Memory as Memory Engine
    participant Think as Thinking Engine
    participant LLM as Gemini AI
    participant Verify as Verification Engine

    Router->>Memory: Retrieve Context (Pinecone + PG)
    Memory-->>Router: Context & History
    Router->>Think: Analyze Intent & Plan Steps
    Think->>LLM: Execute Prompts
    LLM-->>Think: Draft Response
    Think->>Verify: Cross-check facts & safety
    Verify-->>Think: Verified Final Output
    Think-->>Router: Final Output
```

## 5. INFRASTRUCTURE & DEPLOYMENT
- **Compute**: Google Cloud Run (Serverless Container) / AWS ECS
- **Database**: PostgreSQL (Cloud SQL / RDS)
- **Cache**: Redis (Memorystore / ElastiCache)
- **Vector DB**: Pinecone (Managed) / Qdrant
- **Storage**: AWS S3 / Google Cloud Storage
- **Logging**: Winston -> Cloud Logging / Datadog
- **Scaling**: Auto-scaling configured in Cloud Run based on CPU/Concurrency.

## 6. ENVIRONMENT CONFIGURATION (.env.example)
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/navix
REDIS_URL=redis://localhost:6379

# Vector DB
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=navix-memory

# Security
JWT_SECRET=super_secret_jwt_key
API_RATE_LIMIT=120

# AI Providers
GEMINI_API_KEY=your_gemini_key
```
