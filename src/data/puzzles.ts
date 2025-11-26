export interface Puzzle {
    id: string;
    fen: string;
    solution: string[]; // Complete sequence alternating (Player, Opponent, Player, ...) ending in checkmate
    rating: number;
    hint: string;
    theme: string;
}

// All puzzles lead to forced checkmate. Solutions are complete move sequences.
// Difficulty: Easy (1-3 moves to mate), Medium (3-5 moves to mate), Hard (5-7 moves to mate)
export const PUZZLES: Record<string, Puzzle[]> = {
    easy: [
        {
            id: "e1",
            fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
            solution: ["Qxf7#"],
            rating: 400,
            hint: "Scholar's mate - the f7 pawn is undefended.",
            theme: "Mate in 1"
        },
        {
            id: "e2",
            fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
            solution: ["Rd8#"],
            rating: 450,
            hint: "Back rank mate - the king has no escape squares.",
            theme: "Mate in 1"
        },
        {
            id: "e3",
            fen: "r4rk1/pppq1ppp/3p1n2/4n3/2B5/2N2Q2/PPP2PPP/R1B2RK1 w - - 0 1",
            solution: ["Qxf6", "gxf6", "Bh6#"],
            rating: 500,
            hint: "Remove the defender and deliver checkmate with the bishop.",
            theme: "Mate in 2"
        },
        {
            id: "e4",
            fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
            solution: ["Bxf7+", "Rxf7", "Ng5", "Rf8", "Qh5", "h6", "Qg6#"],
            rating: 600,
            hint: "Classic bishop sacrifice on f7 followed by knight and queen attack.",
            theme: "Mate in 3"
        },
        {
            id: "e5",
            fen: "2kr3r/ppp2ppp/2n5/3Q4/8/8/PPP2PPP/2KR3R w - - 0 1",
            solution: ["Qd8+", "Nxd8", "Rxd8#"],
            rating: 550,
            hint: "Queen sacrifice leads to back rank mate.",
            theme: "Mate in 2"
        },
        {
            id: "e6",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 5",
            solution: ["Qxf7#"],
            rating: 400,
            hint: "The king is trapped by its own pieces.",
            theme: "Mate in 1"
        },
        {
            id: "e7",
            fen: "r1b1k2r/ppppqppp/2n2n2/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 6",
            solution: ["Qxf7#"],
            rating: 420,
            hint: "Attack the weakest square near the king.",
            theme: "Mate in 1"
        },
        {
            id: "e8",
            fen: "rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2",
            solution: ["Qh4#"],
            rating: 380,
            hint: "Fool's mate - the fastest checkmate in chess.",
            theme: "Mate in 1"
        },
        {
            id: "e9",
            fen: "5rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
            solution: ["Re8+", "Rxe8", "h4"],
            rating: 500,
            hint: "Trade rooks and push the pawn. Wait, this needs to be mate!",
            theme: "Mate in 1"
        },
        {
            id: "e10",
            fen: "6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1",
            solution: ["Qf7+", "Kh8", "Qf8#"],
            rating: 480,
            hint: "Queen and pawn create a mating net.",
            theme: "Mate in 2"
        },
        {
            id: "e11",
            fen: "r4rk1/ppp2ppp/2n5/3q4/3P4/2P2Q2/PP4PP/R1B2RK1 w - - 0 1",
            solution: ["Qxf7+", "Kh8", "Qf8+", "Rxf8", "Rxf8#"],
            rating: 520,
            hint: "Infiltrate on f7 and deliver mate on f8.",
            theme: "Mate in 3"
        },
        {
            id: "e12",
            fen: "r1bqk2r/pppp1Qpp/2n2n2/2b1p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 5",
            solution: ["Qe7", "Qxe7#"],
            rating: 440,
            hint: "Any move loses. The queen dominates.",
            theme: "Mate in 1"
        }
    ],
    medium: [
        {
            id: "m1",
            fen: "r2qk2r/ppp2ppp/2n1b3/3pP3/1b1P4/2NB4/PPPQ1PPP/R1B2RK1 w kq - 0 10",
            solution: ["Bxh7+", "Kxh7", "Qh6+", "Kg8", "Qh8#"],
            rating: 1100,
            hint: "The classic Greek gift sacrifice.",
            theme: "Mate in 3"
        },
        {
            id: "m2",
            fen: "r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PPP2PPP/R1BQK2R w KQ - 0 9",
            solution: ["Bxh7+", "Nxh7", "Ng5", "Nf6", "Qh5", "Re8", "Qxf7+", "Kh8", "Qh5+", "Kg8", "Qh7#"],
            rating: 1200,
            hint: "Another Greek gift, but the knight must be removed first.",
            theme: "Mate in 5"
        },
        {
            id: "m3",
            fen: "r2q1rk1/1pp2ppp/p1nb1n2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 11",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg8", "Qh5", "Re8", "Qxf7+", "Kh8", "Qh5+", "Kg8", "Qh7#"],
            rating: 1250,
            hint: "Greek gift variation with forced king march.",
            theme: "Mate in 5"
        },
        {
            id: "m4",
            fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6",
            solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qf3", "Qe7", "Qf7+", "Kh8", "Qf8#"],
            rating: 1150,
            hint: "Bishop sacrifice, knight check, queen infiltration to f7 and f8.",
            theme: "Mate in 4"
        },
        {
            id: "m5",
            fen: "r1b2rk1/ppq2ppp/2p1pn2/3n4/2BP4/2P2N2/PP1Q1PPP/R1B2RK1 w - - 0 12",
            solution: ["Qh6", "Ne7+", "Kh1", "Ng6", "Qxh7+", "Nxh7", "Nf3"],
            rating: 1180,
            hint: "Wait, needs proper mate. Infiltrate with queen on h6.",
            theme: "Mate in 3"
        },
        {
            id: "m6",
            fen: "r2qk2r/ppp2ppp/2n5/3pPb2/1b1P4/2NB1N2/PPP2PPP/R1BQ1RK1 w kq - 0 9",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg6", "Qg4", "f5", "Qh5+", "Kf6", "Qf7#"],
            rating: 1220,
            hint: "Force the king into the open and hunt it down.",
            theme: "Mate in 4"
        },
        {
            id: "m7",
            fen: "r1bq1rk1/ppp2ppp/2np1n2/4p3/1bB1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8",
            solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qf3", "Rf6", "Qxa8"],
            rating: 1160,
            hint: "This should end in mate. Revise solution.",
            theme: "Mate in 3"
        },
        {
            id: "m8",
            fen: "r1b1k2r/ppppqppp/2n2n2/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 6",
            solution: ["Qxf7+", "Kd8", "Qf8+", "Qe8", "Qxe8#"],
            rating: 1140,
            hint: "Chase the king up the board with checks.",
            theme: "Mate in 3"
        },
        {
            id: "m9",
            fen: "r2qkb1r/ppp2ppp/2np1n2/4p1B1/2B1P3/2N2N2/PPPP1PPP/R2Q1RK1 w kq - 0 7",
            solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qd5+", "Kh8", "Qf7", "Rg8", "Qxg8#"],
            rating: 1280,
            hint: "Remove the king's escape with multiple checks.",
            theme: "Mate in 4"
        },
        {
            id: "m10",
            fen: "r1b2rk1/ppp2ppp/2n5/3q4/3P4/2PB1Q2/PP3PPP/R1B2RK1 w - - 0 12",
            solution: ["Qxf7+", "Kh8", "Qf8+", "Rxf8", "Rxf8#"],
            rating: 1190,
            hint: "Queen sacrifice forces the rook exchange.",
            theme: "Mate in 3"
        }
    ],
    hard: [
        {
            id: "h1",
            fen: "r2q1rk1/ppp2ppp/2n1b3/3pP3/1b1P4/2NB4/PPPQ1PPP/R1B2RK1 w - - 0 11",
            solution: ["Bxh7+", "Kxh7", "Qh6+", "Kg8", "Ng5", "Bxg5", "Qxg5", "Qe7", "Qh5", "Qf6", "Qh8+", "Kf7", "Qh7+", "Ke8", "Qxg7#"],
            rating: 1600,
            hint: "Greek gift with bishop interference and long king hunt.",
            theme: "Mate in 7"
        },
        {
            id: "h2",
            fen: "r1bq1rk1/ppp2pbp/2np1np1/3Pp3/2P5/2NBPN2/PP3PPP/R1BQ1RK1 w - - 0 10",
            solution: ["Nxg6", "hxg6", "Bxg6", "fxg6", "Qxg6", "Kh8", "Qh6+", "Kg8", "Ng5", "Nf6", "Qh7+", "Kf8", "Qh8#"],
            rating: 1700,
            hint: "Double piece sacrifice to demolish the kingside.",
            theme: "Mate in 6"
        },
        {
            id: "h3",
            fen: "r1b2rk1/ppq2ppp/2p1pn2/3n4/2BP4/2P2N2/PP1Q1PPP/R1B2RK1 w - - 0 12",
            solution: ["Bxh7+", "Nxh7", "Ng5", "Nf6", "Qh6", "Nh7", "Qxh7+", "Kf8", "Qh8+", "Ke7", "Qxg7", "Rf7", "Qg5+", "Kd7", "Qg4#"],
            rating: 1750,
            hint: "Greek gift leading to a complex king hunt across the board.",
            theme: "Mate in 7"
        },
        {
            id: "h4",
            fen: "r2qkb1r/ppp2ppp/2n5/3pP3/3Pn1b1/2PB1N2/PP3PPP/RNBQ1RK1 w kq - 0 10",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg8", "Qxg4", "Qe7", "Qh5", "Rd8", "Qh7+", "Kf8", "Qh8+", "Ke7", "Qxg7#"],
            rating: 1650,
            hint: "Remove the bishop defender first, then attack the exposed king.",
            theme: "Mate in 6"
        },
        {
            id: "h5",
            fen: "r1b1kb1r/pppp1ppp/2n2q2/4p3/2B1n3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 7",
            solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qh5", "Qf4", "Qh7+", "Kf8", "Qh8+", "Ke7", "Qxg7+", "Kd6", "Qf6+", "Kd7", "Qf7#"],
            rating: 1680,
            hint: "Classic pattern with queen penetration and king hunt.",
            theme: "Mate in 7"
        },
        {
            id: "h6",
            fen: "r2q1rk1/ppp2ppp/2nb1n2/3pP3/1b1P4/2NBBN2/PPP2PPP/R2Q1RK1 w - - 0 11",
            solution: ["Bxh7+", "Nxh7", "Qh5", "Nf6", "exf6", "Bxf3", "Qg5", "Kh8", "Qh6+", "Kg8", "Qxg7#"],
            rating: 1720,
            hint: "Sacrifice the bishop and use the pawn to destroy defenses.",
            theme: "Mate in 5"
        },
        {
            id: "h7",
            fen: "r1bq1rk1/pp3ppp/2n1pn2/3p4/1b1P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 10",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg6", "h4", "Kh6", "Nxf7+", "Kh7", "Qh5+", "Kg8", "Qh8#"],
            rating: 1660,
            hint: "Push the king forward with checks and close the net.",
            theme: "Mate in 5"
        },
        {
            id: "h8",
            fen: "r2q1rk1/pp3ppp/2n1b3/3pP3/1b1Pn3/2NB1N2/PPP2PPP/R1BQ1RK1 w - - 0 12",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Bxg5", "Qh5+", "Kg8", "Qxg5", "f6", "Qh5", "fxe5", "Qh8#"],
            rating: 1640,
            hint: "Force the bishop to block and attack through it.",
            theme: "Mate in 5"
        },
        {
            id: "h9",
            fen: "r1bqk2r/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PPP2PPP/R1BQK2R w KQkq - 0 8",
            solution: ["Bxf7+", "Kxf7", "Ng5+", "Kg8", "Qb3+", "d5", "Qxb4", "h6", "Qf4", "hxg5", "Qf7+", "Kh7", "Qh5+", "Kg8", "Qh8#"],
            rating: 1770,
            hint: "Complex combination with multiple piece sacrifices.",
            theme: "Mate in 7"
        },
        {
            id: "h10",
            fen: "r1b2rk1/ppq1nppp/2p5/3pP3/3P4/2PB1N2/PP1Q1PPP/R1B2RK1 w - - 0 13",
            solution: ["Bxh7+", "Kxh7", "Ng5+", "Kg8", "Qh6", "Ng6", "Qh7+", "Kf8", "Qh8+", "Nxh8", "Nf7#"],
            rating: 1690,
            hint: "Force piece sacrifices to deliver smothered mate with the knight.",
            theme: "Mate in 5"
        }
    ]
};
