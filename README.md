# ♟️ MonkChess — A Modern, Interactive Chess Platform

![MonkChess Logo](public/logo/Chess_slt45.svg)

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
**MonkChess** is a high-performance, professional chess application designed for playing, analyzing, and mastering chess. It combines a sleek **obsidian black & dark espresso brown theme** with signature purple accents (`#9d4edd`), crisp piece movement animations, and powerful engine insights.

Whether you want to challenge Stockfish 17, explore 10,000+ ECO openings, solve puzzles, or perform deep position analysis, MonkChess delivers a modern, desktop-grade chess experience.

---

## ✨ **Key Features**

### 🎨 **Modern Interactive Design & Theme**
- **Sleek Dark Theme**: Obsidian black (`#101014`) and dark espresso brown (`#1f1a17`) palette with purple accent lighting.
- **`ShapeGrid` Canvas Background**: Custom HTML5 canvas grid with subtle upward scrolling square tiles and cursor hover glow trails.
- **`ParticleText` Interactive Headline**: Dynamic headline particle text with particle gather animations, mouse repulsion, and glow effects.
- **Crisp Piece Motion**: 180ms ease-out translational piece glide animations powered by Framer Motion position tracking.

### 🎮 **Play Mode**
- **Stockfish 17 Engine**: Real-time evaluation and AI opponent powered by WebAssembly and Web Workers.
- **4-Tier ELO Difficulties**:
  - 🟢 **Beginner (~1000 ELO)**
  - 🔵 **Novice (~1400 ELO)**
  - 🟣 **Intermediate (~1800 ELO)**
  - 🔥 **Advanced (~2200+ ELO)**
- **Game Controls**: Play As (White/Black), Undo, Redo, Flip Board, Hint Engine, and Autoplay mode.
- **ECO Opening Identification**: Real-time opening detection with ECO code badges (e.g. *B90 Sicilian Defense*).
- **Session-Based State Preservation**: In-app tab switching retains board state, while browser page reloads automatically initialize a fresh board.

### 🔍 **Analysis Mode (Pro)**
- **Real-Time Evaluation Bar**: Live centipawn and checkmate evaluation updates.
- **Move Classification**:
  - 🏆 **Brilliant (!!)**
  - ✨ **Great (!)**
  - ✅ **Good**
  - ⚠️ **Inaccuracy (!?)**
  - ❌ **Mistake (?)**
  - 💀 **Blunder (??)**
- **Multi-PV Support**: View top recommended engine lines.
- **PGN Export & Import**: Import and export standard PGN files with move annotations.

### 📚 **Openings & Puzzles**
- **ECO Openings Trainer**: Search and learn thousands of theory lines with interactive move highlights.
- **Tactics & Puzzles**: Practice checkmate patterns and tactical combinations across varying difficulty tiers.

---

## 🛠 **Technology Stack**

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite 7, TypeScript |
| **Styling** | Tailwind CSS, Shadcn UI, Lucide Icons, Custom CSS Variables |
| **Animations** | Framer Motion, Custom HTML5 Canvas 2D Engines (`ShapeGrid`, `ParticleText`) |
| **Chess Logic** | Chess.js |
| **Engine** | Stockfish 17 (WASM), Web Workers |
| **Deployment** | Vercel |

---

## 🏎️ **Getting Started**

To run this project locally:

1. **Clone the repository**
   ```sh
   git clone https://github.com/learnwithharman/chesswithmonk.git
   ```

2. **Navigate to the project directory**
   ```sh
   cd chesswithmonk
   ```

3. **Install dependencies**
   ```sh
   npm install
   ```

4. **Start the development server**
   ```sh
   npm run dev
   ```

---

## 🤝 **Connect & Contributing**

**Author:** Harman  
**Instagram:** [@ded.lecter](https://www.instagram.com/ded.lecter/?hl=en)  
**GitHub:** [learnwithharman](https://github.com/learnwithharman)  
**LinkedIn:** [Harman](https://www.linkedin.com/in/harman-068394327?utm_source=share_via&utm_content=profile&utm_medium=member_android)  

Contributions, issue reports, and pull requests are welcome!

---

<div align="center">
  <p>Made with ❤️ by MonkChess Team</p>
</div>
