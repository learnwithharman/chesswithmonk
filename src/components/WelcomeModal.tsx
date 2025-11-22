import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Swords, Puzzle, Search } from 'lucide-react';

export function WelcomeModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setOpen(true);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem('hasSeenWelcome', 'true');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-2">Welcome to ChessWithMonk! ♟️</DialogTitle>
                    <DialogDescription className="text-center text-lg">
                        The ultimate platform to train, analyze, and master chess with human-like AI.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                        <Swords className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <h3 className="font-semibold">Practice Mode</h3>
                            <p className="text-sm text-muted-foreground">Play against an AI that mimics human mistakes. Adjustable ELO (400-2800).</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                        <BookOpen className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                            <h3 className="font-semibold">Learn Openings</h3>
                            <p className="text-sm text-muted-foreground">Master popular openings with interactive guides and move-by-move feedback.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                        <Puzzle className="w-6 h-6 text-orange-500 mt-1" />
                        <div>
                            <h3 className="font-semibold">Puzzles</h3>
                            <p className="text-sm text-muted-foreground">Sharpen your tactics with puzzles ranging from Easy to Magnus Carlsen level.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                        <Search className="w-6 h-6 text-green-500 mt-1" />
                        <div>
                            <h3 className="font-semibold">Analysis Board</h3>
                            <p className="text-sm text-muted-foreground">Analyze your games or any position with a built-in evaluation engine.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button size="lg" onClick={handleClose} className="w-full sm:w-auto">
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Get Started
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
