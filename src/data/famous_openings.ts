export interface FamousOpeningLine {
    line_id: string;
    moves: string[];
    explanations: string[];
}

export interface FamousOpeningData {
    id: string;
    name: string;
    color: 'white' | 'black';
    description: string;
    fen: string; // Thumbnail/Preview FEN
    totalLines: number;
    lines: FamousOpeningLine[];
}

export const FAMOUS_OPENINGS_DATA: FamousOpeningData[] = [
    {
        id: 'fried-liver',
        name: 'Fried Liver Attack',
        color: 'white',
        description: 'Checkmate your opponent in 8 moves. One of the most dangerous openings in chess.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        totalLines: 10,
        lines: [
            {
                line_id: "l1",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3"],
                explanations: [
                    "White plays e4 to control the center.",
                    "Black replies with e5, challenging the center.",
                    "Nf3 develops the knight and attacks e5.",
                    "Nc6 defends the e5 pawn and develops.",
                    "Bc4 develops the bishop to a strong diagonal, eyeing f7.",
                    "Nf6 is the Two Knights Defense, a solid reply.",
                    "Ng5! The Fried Liver Attack begins, targeting f7.",
                    "d5 is the only good way to stop the threat.",
                    "exd5 opens the e-file and attacks the knight.",
                    "Nxd5? This is the mistake that allows the Fried Liver!",
                    "Nxf7! Sacrificing the knight to expose the king.",
                    "Kxf7 is forced.",
                    "Qf3+ checks the king and attacks the knight on d5.",
                    "Ke6 is the only move to hold onto the knight.",
                    "Nc3 adds more pressure to the pinned knight."
                ]
            },
            {
                line_id: "l2",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "Bb5+", "c6", "dxc6", "bxc6", "Be2"],
                explanations: [
                    "Standard Italian Game setup.",
                    "Black mirrors.",
                    "White attacks e5.",
                    "Black defends.",
                    "White targets f7.",
                    "Two Knights Defense.",
                    "Ng5 attacks f7.",
                    "d5 blocks.",
                    "exd5 captures.",
                    "Na5! The Polerio Defense. Best play.",
                    "Bb5+ checks the king.",
                    "c6 blocks the check.",
                    "dxc6 captures.",
                    "bxc6 recaptures.",
                    "Be2 retreats safely."
                ]
            },
            {
                line_id: "l3",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Na5", "d3", "h6", "Nf3", "e4", "Qe2"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Na5! Polerio.", "d3 supports the center.", "h6 kicks the knight.", "Nf3 retreats.", "e4 attacks the knight.", "Qe2 pins the pawn."
                ]
            },
            {
                line_id: "l4",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kxf2", "Nxe4+", "Kg1", "Qh4"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Ng5 attacks f7.", "Bc5! The Traxler Counterattack.", "Nxf7 forks Queen and Rook.", "Bxf2+! The point of the Traxler.", "Kxf2 captures.", "Nxe4+ checks.", "Kg1 retreats.", "Qh4 threatens mate on f2."
                ]
            },
            {
                line_id: "l5",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "b5", "Bf1", "Qxd5", "Nc3"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "b5! The Ulvestad Variation.", "Bf1 retreats.", "Qxd5 captures.", "Nc3 develops with tempo."
                ]
            },
            {
                line_id: "l6",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nd4", "c3", "b5", "Bf1"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Nd4! The Fritz Variation.", "c3 attacks the knight.", "b5 counter-attacks.", "Bf1 retreats."
                ]
            },
            {
                line_id: "l7",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "d4", "Nxd4", "c3"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Nxd5 allows Fried Liver.", "d4! The Lolli Attack.", "Nxd4 captures.", "c3 kicks the knight."
                ]
            },
            {
                line_id: "l8",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke6", "Nc3", "Nb4", "Qe4", "c6"],
                explanations: [
                    "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Nb4 defends c2 and d5.", "Qe4 centralizes.", "c6 solidifies d5."
                ]
            },
            {
                line_id: "l9",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "Nxf7", "Kxf7", "Qf3+", "Ke8", "Bxd5", "Qd7"],
                explanations: [
                    "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Fried Liver main line.", "Ke8? A safer but passive retreat.", "Bxd5 recovers piece.", "Qd7 defends f7."
                ]
            },
            {
                line_id: "l10",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "d5", "exd5", "Nxd5", "d4", "Be6", "Nxe6", "fxe6"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Nxd5 allows Fried Liver.", "d4! Lolli Attack alternate.", "Be6 develops.", "Nxe6 captures bishop.", "fxe6 opens f-file."
                ]
            }
        ]
    },
    {
        id: 'vienna-gambit',
        name: 'Vienna Gambit',
        color: 'white',
        description: 'Sacrifice a pawn on the third move to win a powerful position.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/2P1P3/2N5/PP1P1PPP/R1BQKBNR b KQkq - 1 2',
        totalLines: 12,
        lines: [
            {
                line_id: "l1",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "exf4", "e5", "Ng8", "Nf3", "d6", "d4"],
                explanations: [
                    "e4 controls the center.", "e5 challenges the center.", "Nc3 protects e4 and prepares f4.", "Nf6 develops and attacks e4.", "f4! The Vienna Gambit.", "exf4 accepts the gambit.", "e5! Pushing the knight back.", "Ng8 retreats.", "Nf3 develops.", "d6 challenges e5.", "d4 supports center."
                ]
            },
            {
                line_id: "l2",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "fxe5", "Nxe4", "Nf3", "Be7", "d4"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "f4! Gambit.", "d5! Best response.", "fxe5 captures.", "Nxe4 centralizes.", "Nf3 develops.", "Be7 prepares castle.", "d4 controls center."
                ]
            },
            {
                line_id: "l3",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "fxe5", "Nxe4", "Qf3", "Nc6", "Bb5"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "f4! Gambit.", "d5! Best response.", "fxe5 captures.", "Nxe4 centralizes.", "Qf3 attacks knight.", "Nc6 develops.", "Bb5 pins knight."
                ]
            },
            {
                line_id: "l4",
                moves: ["e4", "e5", "Nc3", "Nf6", "Bc4", "Nxe4", "Qh5", "Nd6", "Bb3", "Nc6"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "Bc4 develops.", "Nxe4! Frankenstein-Dracula Variation.", "Qh5 threatens mate.", "Nd6 defends f7.", "Bb3 retreats.", "Nc6 develops."
                ]
            },
            {
                line_id: "l5",
                moves: ["e4", "e5", "Nc3", "Nc6", "f4", "exf4", "Nf3", "g5", "h4", "g4", "Ng5"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Nc6 defends.", "f4! Gambit.", "exf4 accepts.", "Nf3 prevents Qh4+.", "g5 holds pawn.", "h4 undermines.", "g4 attacks knight.", "Ng5! Hamppe-Allgaier Gambit."
                ]
            },
            {
                line_id: "l6",
                moves: ["e4", "e5", "Nc3", "Nf6", "g3", "d5", "exd5", "Nxd5", "Bg2", "Nxc3", "bxc3"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "g3! Vienna Hybrid.", "d5 challenges.", "exd5 captures.", "Nxd5 recaptures.", "Bg2 fianchetto.", "Nxc3 trades.", "bxc3 strengthens center."
                ]
            },
            {
                line_id: "l7",
                moves: ["e4", "e5", "Nc3", "Bb4", "f4", "d6", "Nf3", "Nf6", "Bc4"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Bb4 pins knight.", "f4! Gambit.", "d6 supports.", "Nf3 develops.", "Nf6 develops.", "Bc4 develops."
                ]
            },
            {
                line_id: "l8",
                moves: ["e4", "e5", "Nc3", "Bc5", "f4", "d6", "Nf3", "Nf6", "Bc4", "Nc6", "d3"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Bc5 develops.", "f4! Gambit.", "d6 supports.", "Nf3 develops.", "Nf6 develops.", "Bc4 develops.", "Nc6 develops.", "d3 solidifies."
                ]
            },
            {
                line_id: "l9",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "exf4", "e5", "Qe7", "Qe2", "Ng8", "Nf3"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "f4! Gambit.", "exf4 accepts.", "e5 attacks knight.", "Qe7 pins pawn.", "Qe2 unpins.", "Ng8 retreats.", "Nf3 develops."
                ]
            },
            {
                line_id: "l10",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d5", "d3", "dxe4", "fxe5", "Ng4", "Nxe4"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "f4! Gambit.", "d5 counter-gambit.", "d3 supports.", "dxe4 captures.", "fxe5 attacks knight.", "Ng4 moves knight.", "Nxe4 recaptures."
                ]
            },
            {
                line_id: "l11",
                moves: ["e4", "e5", "Nc3", "Nf6", "Bc4", "Nc6", "d3", "Na5", "Nge2", "Nxc4", "dxc4"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "Bc4 develops.", "Nc6 develops.", "d3 solidifies.", "Na5 attacks bishop.", "Nge2 develops.", "Nxc4 captures bishop.", "dxc4 opens d-file."
                ]
            },
            {
                line_id: "l12",
                moves: ["e4", "e5", "Nc3", "Nf6", "f4", "d6", "Nf3", "Nc6", "Bb5", "Bd7", "d3"],
                explanations: [
                    "Vienna Game.", "Vienna Game.", "Vienna Game.", "Vienna Game.", "f4! Gambit.", "d6 declines.", "Nf3 develops.", "Nc6 develops.", "Bb5 pins.", "Bd7 unpins.", "d3 solidifies."
                ]
            }
        ]
    },
    {
        id: 'stafford-gambit',
        name: 'Stafford Gambit',
        color: 'black',
        description: 'Lose a pawn, then swindle your opponent into losing the game.',
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
        totalLines: 10,
        lines: [
            {
                line_id: "l1",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "d3", "Bc5", "Be2", "h5"],
                explanations: [
                    "e4", "e5", "Nf3", "Nf6 Petrov.", "Nxe5 captures.", "Nc6! Stafford.", "Nxc6 accepts.", "dxc6 opens lines.", "d3 solidifies.", "Bc5 targets f2.", "Be2 defends.", "h5! Aggressive flank attack."
                ]
            },
            {
                line_id: "l2",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "Nc3", "Bc5", "h3", "h5", "d3", "Qd6"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Nc3 develops.", "Bc5 targets f2.", "h3 prevents Ng4.", "h5 attacks anyway.", "d3 solidifies.", "Qd6 brings queen out."
                ]
            },
            {
                line_id: "l3",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "e5", "Ne4", "d3", "Bc5", "dxe4", "Bxf2+", "Ke2", "Bg4+"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "e5 attacks knight.", "Ne4 jumps in.", "d3 attacks knight.", "Bc5 ignores threat!", "dxe4? Blunder!", "Bxf2+! Decoy.", "Ke2 forced.", "Bg4+ wins Queen."
                ]
            },
            {
                line_id: "l4",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "f3", "Bc5", "c3", "Nh5", "d4", "Qh4+"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "f3 solidifies e4.", "Bc5 develops.", "c3 prepares d4.", "Nh5! Eyeing h4.", "d4 attacks bishop.", "Qh4+ checks!"
                ]
            },
            {
                line_id: "l5",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "Bc4", "Bc5", "O-O", "Ng4", "h3", "h5"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Bc4 develops.", "Bc5 develops.", "O-O castles.", "Ng4! Attack.", "h3 attacks knight.", "h5 supports knight."
                ]
            },
            {
                line_id: "l6",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "d4", "Nxe4", "Bd3", "d5", "Nxc6", "bxc6"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "d4 declines gambit.", "Nxe4 captures.", "Bd3 develops.", "d5 supports.", "Nxc6 trades.", "bxc6 recaptures."
                ]
            },
            {
                line_id: "l7",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "d3", "Bc5", "Be3", "Bxe3", "fxe3", "Ng4", "Qf3", "Qg5"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "d3 solidifies.", "Bc5 develops.", "Be3 challenges.", "Bxe3 trades.", "fxe3 opens f-file.", "Ng4 attacks e3.", "Qf3 defends.", "Qg5 adds pressure."
                ]
            },
            {
                line_id: "l8",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "d3", "Bc5", "Bg5", "Nxe4", "Bxd8", "Bxf2+", "Ke2", "Bg4#"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "d3 solidifies.", "Bc5 develops.", "Bg5 pins knight.", "Nxe4! Oh no my queen!", "Bxd8 takes queen.", "Bxf2+ checks.", "Ke2 forced.", "Bg4# Mate!"
                ]
            },
            {
                line_id: "l9",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "d3", "Bc5", "c3", "Ng4", "d4", "Qf6"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "d3 solidifies.", "Bc5 develops.", "c3 prepares d4.", "Ng4 attacks f2.", "d4 blocks.", "Qf6 attacks f2 again."
                ]
            },
            {
                line_id: "l10",
                moves: ["e4", "e5", "Nf3", "Nf6", "Nxe5", "Nc6", "Nxc6", "dxc6", "Nc3", "Bc5", "d3", "Ng4", "Be3", "Nxe3", "fxe3", "Bxe3"],
                explanations: [
                    "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Stafford setup.", "Nc3 develops.", "Bc5 develops.", "d3 solidifies.", "Ng4 attacks f2.", "Be3 blocks.", "Nxe3 captures.", "fxe3 captures.", "Bxe3 recovers pawn."
                ]
            }
        ]
    },
    {
        id: 'london-system',
        name: 'London System',
        color: 'white',
        description: 'Solid, reliable, and annoying for Black to face.',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
        totalLines: 10,
        lines: [
            {
                line_id: "l1",
                moves: ["d4", "d5", "Bf4", "Nf6", "e3", "c5", "c3", "Nc6", "Nd2", "e6", "Ngf3", "Bd6", "Bg3"],
                explanations: [
                    "d4 controls center.", "d5 matches.", "Bf4 London Bishop.", "Nf6 develops.", "e3 solidifies.", "c5 challenges.", "c3 supports d4.", "Nc6 develops.", "Nd2 standard London knight.", "e6 solidifies.", "Ngf3 develops.", "Bd6 challenges bishop.", "Bg3 retreats."
                ]
            },
            {
                line_id: "l2",
                moves: ["d4", "Nf6", "Bf4", "d5", "e3", "c5", "c3", "Nc6", "Nd2", "Qb6", "Qb3", "c4", "Qc2"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "Nd2 develops.", "Qb6 attacks b2.", "Qb3 challenges queen.", "c4 pushes.", "Qc2 keeps queens on."
                ]
            },
            {
                line_id: "l3",
                moves: ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "c3", "Nf6", "Nd2", "Bf5", "Ngf3", "e6", "Qb3"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "c5 challenges.", "e3 solidifies.", "Nc6 develops.", "c3 supports.", "Nf6 develops.", "Nd2 develops.", "Bf5 develops active.", "Ngf3 develops.", "e6 solidifies.", "Qb3 attacks b7."
                ]
            },
            {
                line_id: "l4",
                moves: ["d4", "Nf6", "Bf4", "g6", "Nc3", "d5", "e3", "Bg7", "h4", "c6", "h5"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "g6 KID setup.", "Nc3 Jobava London.", "d5 stops e4.", "e3 solidifies.", "Bg7 fianchetto.", "h4! Aggressive.", "c6 solidifies.", "h5 attacks."
                ]
            },
            {
                line_id: "l5",
                moves: ["d4", "d5", "Bf4", "Nf6", "e3", "e6", "Nd2", "Bd6", "Bg3", "O-O", "Bd3", "c5", "c3", "Nc6", "Ngf3"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "Nd2 develops.", "Bd6 challenges.", "Bg3 retreats.", "O-O castles.", "Bd3 develops.", "c5 challenges.", "c3 supports.", "Nc6 develops.", "Ngf3 develops."
                ]
            },
            {
                line_id: "l6",
                moves: ["d4", "d5", "Bf4", "Nf6", "e3", "Bf5", "c4", "e6", "Nc3", "c6", "Qb3", "Qb6", "c5"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "London setup.", "e3 solidifies.", "Bf5 develops.", "c4! Aggressive London.", "e6 solidifies.", "Nc3 develops.", "c6 solidifies.", "Qb3 attacks.", "Qb6 defends.", "c5 pushes."
                ]
            },
            {
                line_id: "l7",
                moves: ["d4", "d5", "Bf4", "c5", "e3", "Nc6", "Nf3", "Nf6", "c3", "Qb6", "Qb3", "c4", "Qxb6", "axb6"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "c5 challenges.", "e3 solidifies.", "Nc6 develops.", "Nf3 develops.", "Nf6 develops.", "c3 supports.", "Qb6 attacks.", "Qb3 trades.", "c4 pushes.", "Qxb6 trades.", "axb6 opens a-file."
                ]
            },
            {
                line_id: "l8",
                moves: ["d4", "Nf6", "Bf4", "e6", "e3", "d5", "Nd2", "Bd6", "Bg3", "O-O", "Bd3", "b6", "Ngf3", "Ba6"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "e6 solidifies.", "e3 solidifies.", "d5 controls center.", "Nd2 develops.", "Bd6 challenges.", "Bg3 retreats.", "O-O castles.", "Bd3 develops.", "b6 prepares fianchetto.", "Ngf3 develops.", "Ba6 trades bad bishop."
                ]
            },
            {
                line_id: "l9",
                moves: ["d4", "d5", "Bf4", "Nf6", "e3", "c5", "c3", "Nc6", "Nd2", "cxd4", "exd4", "Bf5", "Ngf3", "e6"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "London setup.", "London setup.", "c5 challenges.", "c3 supports.", "Nc6 develops.", "Nd2 develops.", "cxd4 trades.", "exd4 recaptures (Exchange Caro).", "Bf5 develops.", "Ngf3 develops.", "e6 solidifies."
                ]
            },
            {
                line_id: "l10",
                moves: ["d4", "Nf6", "Bf4", "g6", "e3", "Bg7", "Nf3", "O-O", "Be2", "d6", "h3", "c5", "c3"],
                explanations: [
                    "London setup.", "London setup.", "London setup.", "g6 KID setup.", "e3 solidifies.", "Bg7 fianchetto.", "Nf3 develops.", "O-O castles.", "Be2 develops.", "d6 controls e5.", "h3 prevents Ng4.", "c5 challenges.", "c3 supports."
                ]
            }
        ]
    },
    {
        id: 'danish-gambit',
        name: 'Danish Gambit',
        color: 'white',
        description: 'Sacrifice a pawn. Then another. Then ANOTHER. End up with a crushing position.',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2',
        totalLines: 10,
        lines: [
            {
                line_id: "l1",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "d5", "Bxd5", "Nf6", "Bxf7+", "Kxf7", "Qxd8", "Bb4+"],
                explanations: [
                    "e4", "e5", "d4 attacks center.", "exd4 captures.", "c3 offers pawn.", "dxc3 accepts.", "Bc4 develops.", "cxb2 accepts another!", "Bxb2. Bishops rake the board.", "d5! Best defense.", "Bxd5 captures.", "Nf6 develops.", "Bxf7+! Discovery tactic.", "Kxf7 captures.", "Qxd8 wins queen.", "Bb4+! Winning queen back."
                ]
            },
            {
                line_id: "l2",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "Bb4+", "Nc3", "Nf6", "Nge2"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Bxb2.", "Bb4+ checks.", "Nc3 blocks.", "Nf6 develops.", "Nge2 develops."
                ]
            },
            {
                line_id: "l3",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "Qg5", "Nf3", "Qxg2", "Rg1"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Bxb2.", "Qg5 attacks g2.", "Nf3 develops.", "Qxg2 captures.", "Rg1 attacks queen."
                ]
            },
            {
                line_id: "l4",
                moves: ["e4", "e5", "d4", "exd4", "c3", "d5", "exd5", "Qxd5", "cxd4", "Nc6", "Nf3", "Bg4", "Be2"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "c3 offers pawn.", "d5! Sorensen Defense.", "exd5 captures.", "Qxd5 recaptures.", "cxd4 recaptures.", "Nc6 develops.", "Nf3 develops.", "Bg4 pins.", "Be2 unpins."
                ]
            },
            {
                line_id: "l5",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Nxc3", "Nc6", "Bc4", "Nf6", "Nf3", "d6", "Qb3"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "c3 offers pawn.", "dxc3 accepts.", "Nxc3 Goring Gambit.", "Nc6 develops.", "Bc4 develops.", "Nf6 develops.", "Nf3 develops.", "d6 solidifies.", "Qb3 attacks f7."
                ]
            },
            {
                line_id: "l6",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "d6", "Nxc3", "Nc6", "Nf3", "Be6", "Bxe6", "fxe6"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "c3 offers pawn.", "dxc3 accepts.", "Bc4 develops.", "d6 solidifies.", "Nxc3 recaptures.", "Nc6 develops.", "Nf3 develops.", "Be6 challenges.", "Bxe6 trades.", "fxe6 opens f-file."
                ]
            },
            {
                line_id: "l7",
                moves: ["e4", "e5", "d4", "exd4", "c3", "Qe7", "Bd3", "d5", "e5", "Qxe5+", "Ne2", "dxc3", "Nbxc3"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "c3 offers pawn.", "Qe7 declines.", "Bd3 defends.", "d5 challenges.", "e5 pushes.", "Qxe5+ checks.", "Ne2 blocks.", "dxc3 captures.", "Nbxc3 develops."
                ]
            },
            {
                line_id: "l8",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "c6", "Nc3", "d6", "Nf3"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Bxb2.", "c6 solidifies.", "Nc3 develops.", "d6 solidifies.", "Nf3 develops."
                ]
            },
            {
                line_id: "l9",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "cxb2", "Bxb2", "Qe7", "Nc3", "c6", "Nge2"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "Bxb2.", "Qe7 defends.", "Nc3 develops.", "c6 solidifies.", "Nge2 develops."
                ]
            },
            {
                line_id: "l10",
                moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4", "Nf6", "Nxc3", "Bb4", "e5", "d5", "exf6", "dxc4"],
                explanations: [
                    "Danish setup.", "Danish setup.", "Danish setup.", "Danish setup.", "c3 offers pawn.", "dxc3 accepts.", "Bc4 develops.", "Nf6 develops.", "Nxc3 recaptures.", "Bb4 pins.", "e5 attacks.", "d5 counter-attacks.", "exf6 captures.", "dxc4 captures bishop."
                ]
            }
        ]
    },
    {
        id: 'traxler-counterattack',
        name: 'Traxler Counterattack',
        color: 'black',
        description: 'The ultimate counter-gambit. Ignore the threat and attack the King!',
        fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
        totalLines: 10,
        lines: [
            {
                line_id: "l1",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kxf2", "Nxe4+", "Kg1", "Qh4", "g3", "Nxg3"],
                explanations: [
                    "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Standard setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kxf2 accepts.", "Nxe4+ checks.", "Kg1 safe square.", "Qh4 threatens mate.", "g3 blocks.", "Nxg3! Sacrifice again."
                ]
            },
            {
                line_id: "l2",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kf1", "Qe7", "Nxh8", "d5"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kf1 declines sacrifice.", "Qe7 defends.", "Nxh8 takes rook.", "d5! Opens diagonal."
                ]
            },
            {
                line_id: "l3",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Bxf7+", "Ke7", "Bb3", "Rf8", "O-O", "d6"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Bxf7+ checks.", "Ke7 moves king.", "Bb3 retreats.", "Rf8 attacks f-file.", "O-O castles.", "d6 solidifies."
                ]
            },
            {
                line_id: "l4",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "d4", "d5", "Bxd5", "Nxd4", "c3", "Ne6"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "d4 counter-strike.", "d5 counter-strike.", "Bxd5 captures.", "Nxd4 captures.", "c3 kicks knight.", "Ne6 retreats."
                ]
            },
            {
                line_id: "l5",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kxf2", "Nxe4+", "Ke3", "Qh4", "g3", "Nxg3"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kxf2 accepts.", "Nxe4+ checks.", "Ke3? King walk.", "Qh4 attacks.", "g3 blocks.", "Nxg3! Sacrifice."
                ]
            },
            {
                line_id: "l6",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kxf2", "Nxe4+", "Kg1", "Qh4", "Qf1", "Rf8"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kxf2 accepts.", "Nxe4+ checks.", "Kg1 safe square.", "Qh4 threatens mate.", "Qf1 defends.", "Rf8 pins."
                ]
            },
            {
                line_id: "l7",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kxf2", "Nxe4+", "Ke1", "Qh4+", "g3", "Nxg3", "hxg3", "Qxh1+"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kxf2 accepts.", "Nxe4+ checks.", "Ke1 retreats.", "Qh4+ checks.", "g3 blocks.", "Nxg3! Sacrifice.", "hxg3 captures.", "Qxh1+ wins rook."
                ]
            },
            {
                line_id: "l8",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "b4", "Bxb4", "c3", "Be7", "Nxf7"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "b4! Deflection.", "Bxb4 captures.", "c3 kicks bishop.", "Be7 retreats.", "Nxf7 forks."
                ]
            },
            {
                line_id: "l9",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "d3", "O-O", "Nc3", "d6", "O-O", "h6", "Nf3"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "d3 declines.", "O-O castles.", "Nc3 develops.", "d6 solidifies.", "O-O castles.", "h6 kicks knight.", "Nf3 retreats."
                ]
            },
            {
                line_id: "l10",
                moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6", "Ng5", "Bc5", "Nxf7", "Bxf2+", "Kf1", "Qe7", "Nxh8", "Bb6", "Nc3", "Qc5"],
                explanations: [
                    "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Traxler setup.", "Ng5 attacks f7.", "Bc5! Traxler.", "Nxf7 forks.", "Bxf2+! Sacrifice.", "Kf1 declines.", "Qe7 defends.", "Nxh8 takes rook.", "Bb6 retreats.", "Nc3 develops.", "Qc5 threatens mate."
                ]
            }
        ]
    }
];
