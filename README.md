# ♟️ MonkChess — A Modern, Interactive Chess Platform

![MonkChess Logo](public/logo/edumonk.svg)

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-success?style=for-the-badge&logo=vercel)](https://chesswithmonkk.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Stockfish](https://img.shields.io/badge/Stockfish_17-FFA500?style=for-the-badge&logo=lichess&logoColor=white)](https://stockfishchess.org/)

</div>

---

## 🚀 **Live Demo**
👉 **Play Now:** [https://chesswithmonkk.vercel.app/](https://chesswithmonkk.vercel.app/)

---

## 📖 **Overview**
**MonkChess** is a high-performance, full-featured chess application built to **play**, **learn**, and **analyze** chess at a professional level.  
It combines a beautiful modern UI with powerful engine-driven insights — perfect for both beginners and advanced players.

Whether you want to challenge Stockfish 17, analyze your games with professional-grade evaluation, or master famous openings, MonkChess has you covered.

---

## ✨ **Key Features**

### 🎮 **Play Mode**
- **Strongest AI**: Play against **Stockfish 17.1 (WebAssembly)** directly in your browser.
- **Adjustable Difficulty**: From Beginner (~800 ELO) to Grandmaster (~3000+ ELO).
- **Smooth Gameplay**: Responsive board, drag-and-drop, and click-to-move support.
- **Game Controls**: Undo, Redo, Flip Board, Hint System.

### 🔍 **Analysis Mode (Pro)**
- **Real-Time Evaluation**: See the evaluation bar and centipawn score instantly.
- **Move Classification**:
  - 🏆 **Brilliant (!!)**
  - ✨ **Great (!)**
  - ✅ **Good**
  - ⚠️ **Inaccuracy (!?)**
  - ❌ **Mistake (?)**
  - 💀 **Blunder (??)**
- **Multi-PV Support**: See up to 5 best engine lines simultaneously.
- **PGN Export**: Auto-generate PGNs with site metadata and game results.

### 📚 **Openings Trainer**
- **Curated Library**: Explore a collection of famous openings and variations.
- **Top Sequences**: Learn historical openings like the *King's Indian Defense*, *Ruy Lopez*, or *Sicilian Dragon*.
- **Interactive Drill Mode**: The AI plays the opponent's moves automatically, helping you memorize lines.

### 🧩 **Puzzles & Tactics**
- **Tactical Training**: Sharpen your vision with a collection of challenging puzzles.
- **Difficulty Levels**: Easy (Mate in 1), Medium (Mate in 2), Hard (Mate in 5+).
- **Hints & Solutions**: Get visual cues if you're stuck.

### 📱 **Fully Responsive (Mobile First)**
- **Mobile Optimized**: Custom layouts for iPhone/Android.
- **Touch Friendly**: Optimized board sizing and touch controls.
- **PWA Ready**: designed to feel like a native app.

---

## 🛠 **Technology Stack**

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Vite, TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI, Lucide Icons |
| **Chess Logic** | Chess.js, React-Chessboard |
| **Engine** | Stockfish 17.1 (WASM), Web Workers |
| **State** | React Hooks, Context API |
| **Deployment** | Vercel |

---

## 📸 **Screenshots**

| Play Mode | Analysis Mode |
|-----------|---------------|
| *Classic board with controls* | *Deep engine evaluation with graphs* |

| Openings | Mobile View |
|----------|-------------|
| *Explore thousands of variations* | *Perfectly optimized for phones* |

---

## 🏎️ **Getting Started**

To run this project locally:

1.  **Clone the repository**
    ```sh
    git clone https://github.com/learnwithharman/chesswithmonk.git
    ```

2.  **Navigate to the project directory**
    ```sh
    cd chesswithmonk
    ```

3.  **Install dependencies**
    ```sh
    npm install
    ```

4.  **Start the development server**
    ```sh
    npm run dev
    ```

---

## 🤝 **Connect & Contributing**

**Author:** Harman  
**Instagram:** [@cozy.monkk](https://instagram.com/cozy.monkk)  

Feel free to fork this repository and submit pull requests. Any contributions to improve the engine integration or UI are welcome!

---

<div align="center">
  <p>Made with ❤️ by MonkChess Team</p>
</div>
