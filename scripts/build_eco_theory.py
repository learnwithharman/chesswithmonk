# scripts/build_eco_theory.py
"""
Build a canonical ECO theory database from the lichess-org/chess-openings dataset.
This script:
1. Downloads the full ECO TSV datasets (A, B, C, D, E).
2. Parses every opening line using python-chess.
3. Builds a global Move Tree (Trie) merging all transpositions.
4. Generates FENs and SAN sequences for every node.
5. Exports the structured data to `public/data/eco_theory.json`.

Usage:
    python scripts/build_eco_theory.py
"""

import json
import os
import sys
import requests
import chess
import chess.pgn
import io
from pathlib import Path
from collections import defaultdict

# URLs for the standard ECO datasets (TSV format)
ECO_URLS = [
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/a.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/b.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/c.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/d.tsv",
    "https://raw.githubusercontent.com/lichess-org/chess-openings/master/e.tsv",
]
OUTPUT_FILE = Path("public/data/eco_theory.json")

def download_eco_data():
    """Download the ECO TSV files."""
    if not os.path.exists("data"):
        os.makedirs("data")
    
    all_data = []
    
    for url in ECO_URLS:
        filename = url.split("/")[-1]
        local_path = Path(f"data/{filename}")
        
        if not local_path.exists():
            print(f"Downloading {filename} from {url}...")
            try:
                resp = requests.get(url)
                resp.raise_for_status()
                with open(local_path, "w", encoding="utf-8") as f:
                    f.write(resp.text)
            except Exception as e:
                print(f"Error downloading {filename}: {e}")
                continue
        
        print(f"Parsing {filename}...")
        with open(local_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            # Skip header
            if len(lines) > 0 and lines[0].startswith("eco"):
                lines = lines[1:]
            
            for line in lines:
                parts = line.strip().split("\t")
                if len(parts) >= 3:
                    all_data.append({
                        "eco": parts[0],
                        "name": parts[1],
                        "moves": parts[2]
                    })
    
    return all_data

def build_move_tree(eco_data):
    """
    Build a trie structure from ECO lines.
    Structure:
    {
        "fen": {
            "san": "e4",
            "eco": "B00",
            "name": "King's Pawn",
            "children": { ... }
        }
    }
    """
    print(f"Building Move Tree from {len(eco_data)} ECO lines...")
    
    # The tree is a dictionary mapping FEN -> Node Data
    position_db = {}
    
    # Root node
    root_board = chess.Board()
    root_fen = root_board.fen()
    position_db[root_fen] = {
        "fen": root_fen,
        "moves": {}, # Map SAN -> Next FEN
        "openings": [], # List of openings reaching this position
        "depth": 0
    }

    count = 0
    for item in eco_data:
        eco_code = item['eco']
        name = item['name']
        moves_san = item['moves']
        
        try:
            # Create a dummy PGN string
            pgn_str = f'[Event "?"]\n\n{moves_san}'
            pgn_io = io.StringIO(pgn_str)
            game = chess.pgn.read_game(pgn_io)
            
            if not game:
                continue

            # Traverse the game moves
            node = game
            current_fen = root_fen
            depth = 0
            
            while node.next():
                next_node = node.next()
                move = next_node.move
                san = next_node.san
                
                # Make move on board (we need to reconstruct board state)
                board = chess.Board(current_fen)
                board.push(move)
                new_fen = board.fen()
                depth += 1
                
                # Get SAN string (handle both property and method for compatibility)
                san = next_node.san()

                if san not in position_db[current_fen]["moves"]:
                    position_db[current_fen]["moves"][san] = new_fen
                
                # Create new position entry if it doesn't exist
                if new_fen not in position_db:
                    position_db[new_fen] = {
                        "fen": new_fen,
                        "moves": {},
                        "openings": [],
                        "depth": depth
                    }
                
                # Move to next
                current_fen = new_fen
                node = next_node
            
            # Mark the final position as this specific ECO opening
            existing = [op for op in position_db[current_fen]["openings"] if op["name"] == name]
            if not existing:
                position_db[current_fen]["openings"].append({
                    "eco": eco_code,
                    "name": name,
                    "full_line": moves_san
                })
            
            count += 1
            if count % 500 == 0:
                print(f"Processed {count} openings...")
                
        except Exception as e:
            print(f"Error parsing {eco_code} ({name}): {e}")
            continue

    print(f"Finished processing {count} ECO openings.")
    print(f"Total unique positions (transpositions merged): {len(position_db)}")
    return position_db

def export_data(position_db):
    """Export the built tree to JSON."""
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"Exporting to {OUTPUT_FILE}...")
    try:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(position_db, f, indent=2)
        print("Done!")
    except Exception as e:
        print(f"Error exporting JSON: {e}")

    # Export Index
    INDEX_FILE = Path("public/data/eco_index.json")
    print(f"Exporting index to {INDEX_FILE}...")
    
    # Group by ECO
    index = defaultdict(list)
    for fen, node in position_db.items():
        for op in node["openings"]:
            # Avoid duplicates in index
            if not any(x["name"] == op["name"] for x in index[op["eco"]]):
                index[op["eco"]].append({
                    "name": op["name"],
                    "eco": op["eco"],
                    "fen": fen,
                    "moves": op["full_line"]
                })
    
    # Sort variations within each ECO
    for eco in index:
        index[eco].sort(key=lambda x: len(x["name"]))

    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)
    print("Index exported!")

def main():
    eco_data = download_eco_data()
    position_db = build_move_tree(eco_data)
    export_data(position_db)


if __name__ == "__main__":
    main()
