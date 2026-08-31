import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Swords, GraduationCap, Puzzle, Search, Library, Menu, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
            description: "This feature is under active development."
        });
        setIsMenuOpen(false);
    };

    return (
        <header className="border-b border-border/80 bg-card/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left Side: Logo + Brand */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0" onClick={() => setIsMenuOpen(false)}>
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                        <Logo className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight inline-block whitespace-nowrap">
                        ChessWith<span className="text-primary">Monk</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                    <nav className="flex items-center gap-1.5 mr-2">
                        <Link to="/play">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 font-medium h-9 px-3.5 transition-all",
                                    isActive('/play') ? "bg-primary/15 text-primary border border-primary/30 font-semibold" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Swords className="w-4 h-4" />
                                <span>Play</span>
                            </Button>
                        </Link>
                        <Link to="/openings">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 font-medium h-9 px-3.5 transition-all",
                                    isActive('/openings') ? "bg-primary/15 text-primary border border-primary/30 font-semibold" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Library className="w-4 h-4" />
                                <span>Openings</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "gap-2 font-medium h-9 px-3.5 transition-all text-muted-foreground hover:text-foreground",
                                isActive('/learn-openings') && "bg-primary/15 text-primary border border-primary/30 font-semibold"
                            )}
                            onClick={handleLearnClick}
                        >
                            <GraduationCap className="w-4 h-4" />
                            <span>Learn</span>
                        </Button>
                        <Link to="/puzzles">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 font-medium h-9 px-3.5 transition-all",
                                    isActive('/puzzles') ? "bg-primary/15 text-primary border border-primary/30 font-semibold" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Puzzle className="w-4 h-4" />
                                <span>Puzzles</span>
                            </Button>
                        </Link>
                        <Link to="/analysis">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "gap-2 font-medium h-9 px-3.5 transition-all",
                                    isActive('/analysis') ? "bg-primary/15 text-primary border border-primary/30 font-semibold" : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Search className="w-4 h-4" />
                                <span>Analysis</span>
                            </Button>
                        </Link>
                    </nav>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="rounded-lg h-9 w-9 border-border/70 hover:bg-secondary"
                        title="Toggle theme"
                    >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDarkMode(!darkMode)}
                        className="rounded-lg h-9 w-9 border-border/70"
                    >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isMenuOpen && (
                <div className="lg:hidden border-t border-border/80 bg-card/95 backdrop-blur-md absolute w-full left-0 shadow-xl animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 space-y-2">
                        <Link to="/play" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/play') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-11 text-base font-medium">
                                <Swords className="w-5 h-5 text-primary" />
                                Play
                            </Button>
                        </Link>
                        <Link to="/openings" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/openings') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-11 text-base font-medium">
                                <Library className="w-5 h-5 text-primary" />
                                Openings
                            </Button>
                        </Link>
                        <Button
                            variant={isActive('/learn-openings') ? 'secondary' : 'ghost'}
                            className="w-full justify-start gap-3 h-11 text-base font-medium"
                            onClick={handleLearnClick}
                        >
                            <GraduationCap className="w-5 h-5 text-primary" />
                            Learn
                        </Button>
                        <Link to="/puzzles" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/puzzles') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-11 text-base font-medium">
                                <Puzzle className="w-5 h-5 text-primary" />
                                Puzzles
                            </Button>
                        </Link>
                        <Link to="/analysis" onClick={() => setIsMenuOpen(false)}>
                            <Button variant={isActive('/analysis') ? 'secondary' : 'ghost'} className="w-full justify-start gap-3 h-11 text-base font-medium">
                                <Search className="w-5 h-5 text-primary" />
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

