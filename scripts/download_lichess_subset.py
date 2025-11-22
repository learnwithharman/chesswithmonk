# download_lichess_subset.py
"""Download a Lichess PGN dump and filter for high‑rated games.

Usage::
    python download_lichess_subset.py \
        --url https://database.lichess.org/standard/lichess_db_standard_rated_2024-10.pgn.bz2 \
        --min-rating 2000 \
        --output-format pgn   # pgn | jsonl | sqlite
        --output-file high_rated_games.pgn

The script:
1. Streams the compressed .bz2 file to avoid huge memory usage.
2. Parses each game with ``python‑chess``.
3. Keeps a game only if BOTH players have an Elo >= ``min_rating``.
4. Writes the result in the requested format:
   * **pgn** – plain PGN (default)
   * **jsonl** – one JSON object per line with keys ``fen``, ``moves``, ``white_elo``, ``black_elo``, ``event`` etc.
   * **sqlite** – a tiny SQLite DB (table ``games``) with the same columns as the JSONL version.

Dependencies::
    pip install requests tqdm python-chess

Note::
* The public Lichess dump is ~30 GB compressed. The script processes it line‑by‑line, so you only need enough disk space for the filtered output.
* If you prefer a different Lichess dump (e.g., a specific month), just change the ``--url`` argument.
"""

import argparse
import bz2
import json
import os
import sqlite3
import sys
from pathlib import Path

import requests
from tqdm import tqdm
import chess.pgn


def download_file(url: str, dest: Path) -> Path:
    """Download a file with a progress bar.
    Returns the path to the downloaded file.
    """
    dest.parent.mkdir(parents=True, exist_ok=True)
    response = requests.get(url, stream=True, timeout=30)
    total = int(response.headers.get('content-length', 0))
    with open(dest, 'wb') as f, tqdm(
        total=total, unit='B', unit_scale=True, desc='Downloading'
    ) as pbar:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                pbar.update(len(chunk))
    return dest


def filter_games(
    pgn_path: Path,
    min_rating: int,
    output_format: str,
    output_path: Path,
):
    """Stream‑process the compressed PGN and write filtered games.
    """
    # Prepare output handles
    if output_format == 'pgn':
        out_f = open(output_path, 'w', encoding='utf-8')
    elif output_format == 'jsonl':
        out_f = open(output_path, 'w', encoding='utf-8')
    elif output_format == 'sqlite':
        conn = sqlite3.connect(output_path)
        cur = conn.cursor()
        cur.execute(
            '''CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT,
                site TEXT,
                date TEXT,
                round TEXT,
                white TEXT,
                black TEXT,
                result TEXT,
                white_elo INTEGER,
                black_elo INTEGER,
                moves TEXT,
                fen TEXT
            )'''
        )
        conn.commit()
    else:
        raise ValueError('Unsupported output format')

    total_kept = 0
    total_seen = 0
    # Open the bz2 stream
    with bz2.open(pgn_path, 'rt', encoding='utf-8', errors='ignore') as stream:
        while True:
            game = chess.pgn.read_game(stream)
            if game is None:
                break
            total_seen += 1
            # Extract ratings – Lichess stores them in the "WhiteElo"/"BlackElo" tags
            try:
                white_elo = int(game.headers.get('WhiteElo', 0))
                black_elo = int(game.headers.get('BlackElo', 0))
            except ValueError:
                continue
            if white_elo < min_rating or black_elo < min_rating:
                continue
            # Keep this game
            total_kept += 1
            if output_format == 'pgn':
                exporter = chess.pgn.StringExporter(headers=True, variations=False, comments=False)
                out_f.write(game.accept(exporter) + '\n\n')
            elif output_format == 'jsonl':
                moves = ' '.join(move.uci() for move in game.mainline_moves())
                obj = {
                    'event': game.headers.get('Event'),
                    'site': game.headers.get('Site'),
                    'date': game.headers.get('Date'),
                    'round': game.headers.get('Round'),
                    'white': game.headers.get('White'),
                    'black': game.headers.get('Black'),
                    'result': game.headers.get('Result'),
                    'white_elo': white_elo,
                    'black_elo': black_elo,
                    'moves': moves,
                    'fen': game.end().board().fen()
                }
                out_f.write(json.dumps(obj) + '\n')
            else:  # sqlite
                moves = ' '.join(move.uci() for move in game.mainline_moves())
                cur.execute(
                    '''INSERT INTO games (event, site, date, round, white, black, result, white_elo, black_elo, moves, fen)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
                    (
                        game.headers.get('Event'),
                        game.headers.get('Site'),
                        game.headers.get('Date'),
                        game.headers.get('Round'),
                        game.headers.get('White'),
                        game.headers.get('Black'),
                        game.headers.get('Result'),
                        white_elo,
                        black_elo,
                        moves,
                        game.end().board().fen()
                    )
                )
    # Close outputs
    if output_format == 'pgn' or output_format == 'jsonl':
        out_f.close()
    else:
        conn.commit()
        conn.close()
    print(f'Processed {total_seen:,} games, kept {total_kept:,} (rating ≥ {min_rating})')


def main():
    parser = argparse.ArgumentParser(description='Download and filter Lichess PGN dump')
    parser.add_argument('--url', required=True, help='URL of the .pgn.bz2 Lichess dump')
    parser.add_argument('--min-rating', type=int, default=2000, help='Minimum player rating to keep')
    parser.add_argument('--output-format', choices=['pgn', 'jsonl', 'sqlite'], default='pgn',
                        help='Desired output format')
    parser.add_argument('--output-file', required=True, help='Path for the filtered output')
    parser.add_argument('--temp-dir', default='tmp', help='Directory to store the downloaded archive')
    args = parser.parse_args()

    url = args.url
    archive_path = Path(args.temp_dir) / Path(url).name
    # Step 1: download if not already present
    if not archive_path.is_file():
        print('Downloading archive...')
        download_file(url, archive_path)
    else:
        print(f'Archive already present: {archive_path}')

    # Step 2: filter
    filter_games(
        pgn_path=archive_path,
        min_rating=args.min_rating,
        output_format=args.output_format,
        output_path=Path(args.output_file)
    )

if __name__ == '__main__':
    main()
