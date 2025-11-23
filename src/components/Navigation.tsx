import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, BookOpen, Swords, GraduationCap, Puzzle, Search, Library } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

interface NavigationProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const Navigation = ({ darkMode, setDarkMode }: NavigationProps) => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleLearnClick = () => {
        toast.info("Coming Soon", {
            description: "This feature is under development."
        });
    };

    return (
        <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left Side: Logo + Brand */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0">
                    <Logo className="w-8 h-8" />
                    <span className="text-lg md:text-xl font-bold tracking-tight hidden sm:inline-block whitespace-nowrap">
                        ChessWith<span className="text-primary">Monk</span>
                    </span>
                </Link>

                {/* Right Side: Navigation Links & Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <nav className="hidden lg:flex items-center gap-1 mr-2">
                        <Link to="/play">
                            <Button variant={isActive('/play') ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 font-medium">
                                <Swords className="w-4 h-4" />
                                <span className="hidden xl:inline">Play</span>
                            </Button>
                        </Link>
                        <Link to="/openings">
                            <Button variant={isActive('/openings') ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 font-medium">
                                <Library className="w-4 h-4" />
                                <span className="hidden xl:inline">Openings</span>
                            </Button>
                        </Link>
                        <Button
                            variant={isActive('/learn-openings') ? 'secondary' : 'ghost'}
                            size="sm"
                            className="gap-1.5 font-medium"
                            onClick={handleLearnClick}
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span className="hidden xl:inline">Learn</span>
                        </Button>
                        <Link to="/puzzles">
                            <Button variant={isActive('/puzzles') ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 font-medium">
                                <Puzzle className="w-4 h-4" />
                                <span className="hidden xl:inline">Puzzles</span>
                            </Button>
                        </Link>
                        <Link to="/analysis">
                            <Button variant={isActive('/analysis') ? 'secondary' : 'ghost'} size="sm" className="gap-1.5 font-medium">
                                <Search className="w-4 h-4" />
                                <span className="hidden xl:inline">Analysis</span>
                            </Button>
                        </Link>
                    </nav>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="rounded-full"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Bar (Bottom Fixed or Top Overflow) */}
            <div className="md:hidden border-t border-border bg-card overflow-x-auto">
                <nav className="flex items-center justify-around p-2 min-w-max mx-auto">
                    <Link to="/play">
                        <Button variant={isActive('/play') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                            <Swords className="w-4 h-4" />
                            Play
                        </Button>
                    </Link>
                    <Link to="/openings">
                        <Button variant={isActive('/openings') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                            <Library className="w-4 h-4" />
                            Openings
                        </Button>
                    </Link>
                    <Button
                        variant={isActive('/learn-openings') ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-2"
                        onClick={handleLearnClick}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Learn
                    </Button>
                    <Link to="/puzzles">
                        <Button variant={isActive('/puzzles') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                            <Puzzle className="w-4 h-4" />
                            Puzzles
                        </Button>
                    </Link>
                    <Link to="/analysis">
                        <Button variant={isActive('/analysis') ? 'secondary' : 'ghost'} size="sm" className="gap-2">
                            <Search className="w-4 h-4" />
                            Analysis
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Navigation;
