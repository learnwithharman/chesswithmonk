# MonkChess — A Modern, Interactive Chess Platform

MonkChess is a high-performance, full-featured chess application built to **play**, **learn**, and **analyze** chess at a professional level.  
It combines a beautiful modern UI with powerful engine-driven insights — perfect for both beginners and advanced players.

---

# Features

## Play Mode
- Play full classical chess against **Stockfish 17.1**.
- Smooth piece animations and responsive board interactions.
- Undo / Redo, board flip, hints, and keyboard shortcuts.
- Mobile-friendly gameplay.

---

## Analysis Mode (Engine Powered)
- Real-time analysis using **Stockfish 17.1 (WASM)**.
- Eval bar, best move suggestions, and multi-line evaluation.
- Automatic move classifications:
  - **Brilliant (!!)**
  - **Excellent (!)** 
  - **Good**
  - **Inaccuracy (!?)**
  - **Mistake (?)**
  - **Blunder (??)**
- On-board notation icons just like lichess/chess.com.
- Automatic PGN generation with:
  - Current date
  - Site = "ChessWithMonk"
  - Final result
- PGN import/export support.

---

## Openings Trainer (ALL Openings + Famous Lines)
- Complete openings explorer with structured lines and explanations.
- Two training categories:
  - **Famous Openings**
  - **All Openings**
- Learn Mode:
  - User plays their side.
  - Opponent moves auto-play from the line (lichess-style).
  - Progress tracking and correctness feedback.
- Clear instructional text showing ideas, plans, and motifs.

---

## Puzzles Mode
- Multiple-move puzzles with visual cues.
- **Three difficulties**:
  - Beginner
  - Intermediate
  - Advanced
- Instant feedback, hints, and solution lines.

---

## Modern UI / UX
- Built with **shadcn-ui** and **Tailwind CSS**.
- Dark, polished, professional styling.
- Fully responsive for all screen sizes.
- Smooth transitions & clear layout separation (Play, Openings, Learn, Puzzles, Analysis).

---

# 🛠 Tech Stack

### Frontend
-  **React + Vite**
-  **TypeScript**
-  **Tailwind CSS** + **shadcn-ui**
-  **react-chessboard** (board display)
-  **chess.js** (game logic)

### Engine
- 🔥 **Stockfish 17.1 (WebAssembly)**  
  - Multi-thread support  
  - Adjustable depth  
  - No backend required

### Utilities
- Custom PGN generator and parser  
- Auto-move opening training logic  
- Worker-based engine evaluation  
- File import/export system

---

#  Why This Project Is Impressive (For Recruiters)

### ⭐ Advanced Concepts Implemented
- Integrated in-browser Stockfish 17.1 engine.
- Full analysis pipeline including:
  - CP evaluation delta
  - Move scoring (blunder, brilliant, etc.)
  - In-board annotations  
- Functional Opening Trainer system.

### ⭐ Strong UI Engineering
- Tailwind + shadcn component architecture.
- Optimized rendering and responsive design.
- Smooth UX similar to lichess/chess.com.

### ⭐ Scalable Architecture
- Modular React components.
- Clean separation between:
  - Engine worker  
  - Board state  
  - PGN logic  
  - UI logic  
- Easily extendable to online multiplayer / backend services.

### ⭐ Production-grade Polish
- Auto-generated PGN metadata.
- Advanced puzzle logic.
- Auto-play opening lines.
- Error handling and engine fallback.

STAY IN TOUCH WITH CHESSWITHMONK or Follow me on ig @cozy.monkk for more info I'll update you with my project
---

# 📦 Getting Started

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
