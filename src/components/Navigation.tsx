import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, BookOpen, Swords, GraduationCap, Puzzle, Search, Library, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from 'sonner';

interface NavigationProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

const Navigation = ({ darkMode, setDarkMode }: NavigationProps) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLearnClick = () => {
        toast.info("Coming Soon", {
            description: "This feature is under development."
        });
        setIsMenuOpen(false);
    };

    return (
        <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left Side: Logo + Brand */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
                    <Logo className="w-8 h-8" />
                    <span className="text-lg md:text-xl font-bold tracking-tight inline-block whitespace-nowrap">
                        ChessWith<span className="text-primary">Monk</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                    <nav className="flex items-center gap-1 mr-2">
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

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="rounded-full"
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="lg:hidden border-t border-border bg-card absolute w-full left-0 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 space-y-2">
                        <Link to="/play" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/play') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12 text-base">
                                <Swords className="w-5 h-5" />
                                Play
                            </Button>
                        </Link>
                        <Link to="/openings" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/openings') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12 text-base">
                                <Library className="w-5 h-5" />
                                Openings
                            </Button>
                        </Link>
                        <Button
                            variant={isActive('/learn-openings') ? 'secondary' : 'ghost'}
                            className="w-full justify-start gap-3 h-12 text-base"
                            onClick={handleLearnClick}
                        >
                            <GraduationCap className="w-5 h-5" />
                            Learn
                        </Button>
                        <Link to="/puzzles" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/puzzles') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12 text-base">
                                <Puzzle className="w-5 h-5" />
                                Puzzles
                            </Button>
                        </Link>
                        <Link to="/analysis" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/analysis') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-12 text-base">
                                <Search className="w-5 h-5" />
                                Analysis
                            </Button>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navigation;
