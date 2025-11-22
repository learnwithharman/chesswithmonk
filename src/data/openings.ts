export interface MoveGuide {
    san: string;
    comment: string;
    purpose?: string;
    idea?: string;
    plan?: string;
}

export interface Variation {
    name: string;
    id: string;
    pgn: string;
    description: string;
    moves: MoveGuide[];
}

export interface OpeningGroup {
    name: string;
    variations: Variation[];
}

export interface OpeningRepertoire {
    white: OpeningGroup[];
    black: OpeningGroup[];
}

export const OPENINGS: OpeningRepertoire = {
    white: [
        {
            name: "Italian Game",
            variations: [
                {
                    name: "Giuoco Piano",
                    id: "italian-giuoco-piano",
                    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5",
                    description: "The 'Quiet Game'. White builds a strong center slowly and develops pieces logically.",
                    moves: [
                        {
                            san: "e4",
                            comment: "Controls the center and opens lines for the Queen and Bishop.",
                            purpose: "Control the center (e4, d5).",
                            idea: "Open lines for the Queen and Light-squared Bishop.",
                            plan: "Develop pieces rapidly and castle kingside."
                        },
                        {
                            san: "e5",
                            comment: "Black responds symmetrically, challenging the center.",
                            purpose: "Prevent White from playing d4 immediately.",
                            idea: "Control d4 and f4 squares.",
                            plan: "Develop knights and bishops to active squares."
                        },
                        {
                            san: "Nf3",
                            comment: "Develops the knight, attacks e5, and prepares to castle.",
                            purpose: "Develop a piece while creating a threat.",
                            idea: "Attack the e5 pawn and control d4.",
                            plan: "Prepare for castling short."
                        },
                        {
                            san: "Nc6",
                            comment: "Defends the e5 pawn and develops a piece.",
                            purpose: "Defend the e5 pawn.",
                            idea: "Develop the knight to a natural square.",
                            plan: "Prepare to develop the dark-squared bishop."
                        },
                        {
                            san: "Bc4",
                            comment: "The Italian Bishop! Eyes the weak f7 square.",
                            purpose: "Target the weak f7 pawn.",
                            idea: "Control the d5 square and prepare to castle.",
                            plan: "Build an attack against the Black king."
                        },
                        {
                            san: "Bc5",
                            comment: "Black develops actively to a strong square, mirroring White.",
                            purpose: "Control the center and eye f2.",
                            idea: "Prevent White from building a strong center with d4.",
                            plan: "Develop freely and castle."
                        }
                    ]
                },
                {
                    name: "Fried Liver Attack",
                    id: "italian-fried-liver",
                    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7",
                    description: "A violent attack sacrificing a piece for an exposed King. Only works if Black plays 5...Nxd5?",
                    moves: [
                        { san: "e4", comment: "Standard King's Pawn opening." },
                        { san: "e5", comment: "Black challenges the center." },
                        { san: "Nf3", comment: "Knights out before bishops!" },
                        { san: "Nc6", comment: "Defending e5." },
                        { san: "Bc4", comment: "Targeting f7." },
                        { san: "Nf6", comment: "The Two Knights Defense. Aggressive but allows Ng5." },
                        { san: "Ng5", comment: "Attacking f7 with two pieces! Black has a hard time defending." },
                        { san: "d5", comment: "The only good way to block the bishop." },
                        { san: "exd5", comment: "White takes, opening the e-file." },
                        { san: "Nxd5", comment: "A mistake! This allows the Fried Liver. Better was Na5." },
                        { san: "Nxf7", comment: "BOOM! Sacrificing the knight to draw the King out into the open." }
                    ]
                }
            ]
        },
        {
            name: "Ruy Lopez",
            variations: [
                {
                    name: "Main Line",
                    id: "ruy-lopez-main",
                    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O",
                    description: "One of the oldest and most respected openings. White puts long-term pressure on Black.",
                    moves: [
                        { san: "e4", comment: "Best by test." },
                        { san: "e5", comment: "Solid response." },
                        { san: "Nf3", comment: "Attacking e5." },
                        { san: "Nc6", comment: "Defending e5." },
                        { san: "Bb5", comment: "The Ruy Lopez. Putting pressure on the defender of e5." },
                        { san: "a6", comment: "The Morphy Defense. Asking the bishop a question." },
                        { san: "Ba4", comment: "Retreating to maintain the pin." },
                        { san: "Nf6", comment: "Developing and attacking e4." },
                        { san: "O-O", comment: "Safety first! White castles and gets the rook ready." }
                    ]
                },
                {
                    name: "Berlin Defense",
                    id: "ruy-lopez-berlin",
                    pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6",
                    description: "The 'Berlin Wall'. Extremely solid and hard to crack. Famous for being drawish at top levels.",
                    moves: [
                        { san: "e4", comment: "King's pawn." },
                        { san: "e5", comment: "King's pawn." },
                        { san: "Nf3", comment: "Knight out." },
                        { san: "Nc6", comment: "Knight out." },
                        { san: "Bb5", comment: "Ruy Lopez." },
                        { san: "Nf6", comment: "The Berlin. Counter-attacking e4 immediately instead of playing a6." }
                    ]
                }
            ]
        },
        {
            name: "Queen's Gambit",
            variations: [
                {
                    name: "Queen's Gambit Declined",
                    id: "qgd",
                    pgn: "1. d4 d5 2. c4 e6 3. Nc3 Nf6",
                    description: "A solid, classical defense. Black maintains a strong pawn in the center.",
                    moves: [
                        { san: "d4", comment: "Controls the center and opens lines for the Queen and Bishop." },
                        { san: "d5", comment: "Prevents White from playing e4 immediately." },
                        { san: "c4", comment: "The Queen's Gambit. Offering a side pawn to destroy Black's center." },
                        { san: "e6", comment: "Declined. Black supports d5 with a pawn." },
                        { san: "Nc3", comment: "Developing and adding pressure to d5." },
                        { san: "Nf6", comment: "Developing and defending d5." }
                    ]
                },
                {
                    name: "Queen's Gambit Accepted",
                    id: "qga",
                    pgn: "1. d4 d5 2. c4 dxc4",
                    description: "Black takes the pawn to open lines, but gives up the center temporarily.",
                    moves: [
                        { san: "d4", comment: "Queen's pawn." },
                        { san: "d5", comment: "Queen's pawn." },
                        { san: "c4", comment: "The Gambit." },
                        { san: "dxc4", comment: "Accepted! Black takes the pawn but usually returns it later." }
                    ]
                }
            ]
        },
        {
            name: "London System",
            variations: [
                {
                    name: "Main Setup",
                    id: "london-system",
                    pgn: "1. d4 d5 2. Bf4 Nf6 3. e3 c5 4. c3",
                    description: "A solid, system-based opening where White plays the same setup against almost anything.",
                    moves: [
                        { san: "d4", comment: "Controlling the center." },
                        { san: "d5", comment: "Preventing e4." },
                        { san: "Bf4", comment: "The signature move. Developing the bishop outside the pawn chain." },
                        { san: "Nf6", comment: "Developing the knight." },
                        { san: "e3", comment: "Solidifying the center and protecting d4." },
                        { san: "c5", comment: "Challenging White's center." },
                        { san: "c3", comment: "The London Pyramid. Very solid structure." }
                    ]
                }
            ]
        },
        {
            name: "English Opening",
            variations: [
                {
                    name: "Main Line",
                    id: "english-opening",
                    pgn: "1. c4 e5 2. Nc3 Nf6 3. g3",
                    description: "A flank opening that fights for the center (d5) from the side.",
                    moves: [
                        { san: "c4", comment: "The English. Controls d5 from the flank." },
                        { san: "e5", comment: "Reversed Sicilian. Black fights for the center." },
                        { san: "Nc3", comment: "Developing and controlling d5." },
                        { san: "Nf6", comment: "Developing the knight." },
                        { san: "g3", comment: "Preparing to fianchetto the bishop to control the long diagonal." }
                    ]
                }
            ]
        },
        {
            name: "Scotch Game",
            variations: [
                {
                    name: "Main Line",
                    id: "scotch-game",
                    pgn: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4",
                    description: "An aggressive opening where White opens the center immediately.",
                    moves: [
                        { san: "e4", comment: "King's pawn." },
                        { san: "e5", comment: "King's pawn." },
                        { san: "Nf3", comment: "Knight out." },
                        { san: "Nc6", comment: "Knight out." },
                        { san: "d4", comment: "The Scotch! Striking at the center immediately." },
                        { san: "exd4", comment: "Black must take." },
                        { san: "Nxd4", comment: "Recapturing. White has a space advantage." }
                    ]
                }
            ]
        }
    ],
    black: [
        {
            name: "Sicilian Defense",
            variations: [
                {
                    name: "Najdorf Variation",
                    id: "sicilian-najdorf",
                    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6",
                    description: "The 'Cadillac' of chess openings. Sharp, complex, and aggressive.",
                    moves: [
                        { san: "e4", comment: "White claims the center." },
                        { san: "c5", comment: "The Sicilian! Fighting for d4 from the flank." },
                        { san: "Nf3", comment: "Preparing d4." },
                        { san: "d6", comment: "Controlling e5 and preventing e5 push." },
                        { san: "d4", comment: "Open Sicilian. Opening the center." },
                        { san: "cxd4", comment: "Trading a flank pawn for a center pawn." },
                        { san: "Nxd4", comment: "Recapturing with the knight." },
                        { san: "Nf6", comment: "Attacking e4." },
                        { san: "Nc3", comment: "Defending e4." },
                        { san: "a6", comment: "The Najdorf move! Prevents pieces from using b5 and prepares b5 expansion." }
                    ]
                },
                {
                    name: "Dragon Variation",
                    id: "sicilian-dragon",
                    pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6",
                    description: "Black fianchettoes the bishop for a strong attack on the diagonal.",
                    moves: [
                        { san: "e4", comment: "White claims the center." },
                        { san: "c5", comment: "The Sicilian." },
                        { san: "Nf3", comment: "Knight out." },
                        { san: "d6", comment: "Control e5." },
                        { san: "d4", comment: "Open center." },
                        { san: "cxd4", comment: "Exchange." },
                        { san: "Nxd4", comment: "Recapture." },
                        { san: "Nf6", comment: "Attack e4." },
                        { san: "Nc3", comment: "Defend e4." },
                        { san: "g6", comment: "The Dragon! Preparing to fianchetto the bishop to g7." }
                    ]
                }
            ]
        },
        {
            name: "French Defense",
            variations: [
                {
                    name: "Advance Variation",
                    id: "french-advance",
                    pgn: "1. e4 e6 2. d4 d5 3. e5",
                    description: "A solid defense where Black fights for the center with pawns.",
                    moves: [
                        { san: "e4", comment: "King's pawn." },
                        { san: "e6", comment: "The French. Preparing d5." },
                        { san: "d4", comment: "Taking the center." },
                        { san: "d5", comment: "Challenging e4." },
                        { san: "e5", comment: "The Advance Variation. Closing the center and gaining space." }
                    ]
                }
            ]
        },
        {
            name: "Caro-Kann Defense",
            variations: [
                {
                    name: "Main Line",
                    id: "caro-kann-main",
                    pgn: "1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4",
                    description: "Extremely solid. Similar to the French but the bishop isn't trapped.",
                    moves: [
                        { san: "e4", comment: "King's pawn." },
                        { san: "c6", comment: "The Caro-Kann. Supporting d5." },
                        { san: "d4", comment: "Taking the center." },
                        { san: "d5", comment: "Striking back." },
                        { san: "Nc3", comment: "Defending e4." },
                        { san: "dxe4", comment: "Exchanging pawns." },
                        { san: "Nxe4", comment: "Recapturing. White has a space advantage but Black is very solid." }
                    ]
                }
            ]
        },
        {
            name: "King's Indian Defense",
            variations: [
                {
                    name: "Main Line",
                    id: "kid-main",
                    pgn: "1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6",
                    description: "A hypermodern defense. Black allows White to take the center, then attacks it later.",
                    moves: [
                        { san: "d4", comment: "Queen's pawn." },
                        { san: "Nf6", comment: "Preventing e4." },
                        { san: "c4", comment: "Grabbing space." },
                        { san: "g6", comment: "Preparing to fianchetto." },
                        { san: "Nc3", comment: "Developing." },
                        { san: "Bg7", comment: "The King's Bishop is strong on this diagonal." },
                        { san: "e4", comment: "White builds a massive center." },
                        { san: "d6", comment: "Stopping e5 and preparing to strike back." }
                    ]
                }
            ]
        },
        {
            name: "Nimzo-Indian Defense",
            variations: [
                {
                    name: "Main Line",
                    id: "nimzo-indian",
                    pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4",
                    description: "Controls the center by pinning the knight rather than occupying it with pawns.",
                    moves: [
                        { san: "d4", comment: "Queen's pawn." },
                        { san: "Nf6", comment: "Preventing e4." },
                        { san: "c4", comment: "Grabbing space." },
                        { san: "e6", comment: "Preparing d5 or Bb4." },
                        { san: "Nc3", comment: "Developing." },
                        { san: "Bb4", comment: "The Nimzo! Pinning the knight to control e4." }
                    ]
                }
            ]
        }
    ]
};
