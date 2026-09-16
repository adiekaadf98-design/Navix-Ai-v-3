# NAVIX AI - Official Documentation & Quickstart

Aplikasi Full-Stack AI Platform dengan arsitektur **Express + React 19 + Vite + Tailwind CSS** dan mesin generatif mandiri **Navix Multimedia Foundation (NMF)**.

---

## 🚀 Kenapa Tidak Berfungsi Langsung di GitHub Pages?

Aplikasi Navix AI adalah aplikasi **Full-Stack (Frontend + Backend Server)**, bukan website statis biasa:
1. **GitHub Pages hanya mendukung static HTML/JS** — GitHub Pages tidak dapat menjalankan backend Node.js/Express (`server.ts` & rute `/api/*`).
2. **API Keys / Environment Variables**: File `.env` tidak diunggah ke GitHub demi alasan keamanan.

---

## 🛠️ Cara Menjalankan di Komputer Lokal (Localhost)

Agar Navix AI berjalan 100% persis seperti di AI Studio:

### 1. Clone Repository & Install Dependencies
```bash
git clone <URL_REPOSITORY_ANDA>
cd <NAMA_FOLDER>
npm install
```

### 2. Buat File `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` lalu masukkan API Key Anda:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di: **`http://localhost:3000`**

---

## 🌐 Cara Deploy Online Gratis (Pengganti GitHub Pages)

Gunakan layanan hosting yang mendukung **Node.js Fullstack**:

### Rekomendasi Platform:
- **Render.com** (Web Service):
  - **Build Command:** `npm run build`
  - **Start Command:** `npm start`
  - **Environment Variables:** Tambahkan `GEMINI_API_KEY`
- **Railway.app / Koyeb / Vercel / Google Cloud Run / VPS**:
  - Jalankan `npm run build && npm start` (Port 3000).

---

## 📦 Arsitektur Sistem
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Zustand.
- **Backend:** Express, Node.js, Tsx, Esbuild.
- **NMF Engine:** Navix Multimedia Foundation (`nmf_engine/` & `src/services/NmfInferenceEngine.ts`).

