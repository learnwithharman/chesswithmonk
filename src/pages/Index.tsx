import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Swords, BookOpen, GraduationCap, Puzzle, Search, ArrowRight, Brain, Zap, Globe, Trophy, Target, LineChart, BookMarked } from 'lucide-react';
import Logo from '@/components/Logo';
import { Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const Index = () => {
  // Scroll reveal hooks for each section
  const statsReveal = useScrollReveal({ delay: 100 });
  const featuresHeaderReveal = useScrollReveal({ delay: 100 });
  const feature1Reveal = useScrollReveal({ delay: 100 });
  const feature2Reveal = useScrollReveal({ delay: 200 });
  const feature3Reveal = useScrollReveal({ delay: 300 });
  const feature4Reveal = useScrollReveal({ delay: 100 });
  const feature5Reveal = useScrollReveal({ delay: 200 });
  const feature6Reveal = useScrollReveal({ delay: 300 });
  const ctaReveal = useScrollReveal({ delay: 100 });
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="max-w-4xl space-y-8 animate-in fade-in duration-1000">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center ring-8 ring-primary/5 animate-in zoom-in duration-500">
              <Logo className="w-20 h-20 text-primary animate-glow" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-in slide-in-from-bottom duration-700">
            Master Chess with <span className="text-primary bg-clip-text">MonkChess</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-700 delay-150">
            Powered by <span className="font-semibold text-foreground">Stockfish 17</span>, the world's strongest chess engine.
            Analyze positions, practice against AI, solve puzzles, and master famous openings.
            Your journey to chess mastery starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in slide-in-from-bottom duration-700 delay-300">
            <Link to="/play">
              <Button size="lg" className="text-lg px-8 py-6 gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transition-all group">
                <Swords className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Play Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/openings">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 gap-2 hover:scale-105 transition-all group">
                <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Explore Openings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/20 border-y border-border/50">
        <div
          ref={statsReveal.ref}
          className={`container mx - auto px - 4 transition - all duration - 1000 ${statsReveal.isVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
            } `}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="transition-all duration-500 delay-100">
              <div className="text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-sm text-muted-foreground">ECO Openings</div>
            </div>
            <div className="transition-all duration-500 delay-200">
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <div className="text-sm text-muted-foreground">Puzzles</div>
            </div>
            <div className="transition-all duration-500 delay-300">
              <div className="text-4xl font-bold text-primary mb-2">Stockfish 17</div>
              <div className="text-sm text-muted-foreground">Engine Analysis</div>
            </div>
            <div className="transition-all duration-500 delay-400">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div
            ref={featuresHeaderReveal.ref}
            className={`text - center mb - 16 transition - all duration - 1000 ${featuresHeaderReveal.isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
              } `}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need to Improve</h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div
              ref={feature1Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature1Reveal.isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
                } `}
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Stockfish 17 Analysis</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Get real-time move suggestions with multiple best lines. Configurable depth (up to 25), threads, and hash size for lightning-fast analysis.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Multi-PV analysis (1-5 lines)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Evaluation bar with centipawn scores
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Move quality indicators
                </li>
              </ul>
            </div>

            <div
              ref={feature2Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature2Reveal.isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
                } `}
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform">
                <BookMarked className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">5000+ Opening Library</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Master every ECO opening with interactive lessons. Learn famous lines from Sicilian Dragon to King's Indian, with auto-move and side detection.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Famous & All openings databases
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Auto-play opponent moves
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Learn, Practice, Drill modes
                </li>
              </ul>
            </div>

            <div
              ref={feature3Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature3Reveal.isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
                } `}
            >
              <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <Swords className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Opponents</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Play against human-like AI with adjustable difficulty from Beginner (800 ELO) to Advanced (2000+ ELO). Get real-time hints and suggestions.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  4 difficulty levels
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Human-like play style
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Auto-save games
                </li>
              </ul>
            </div>

            <div
              ref={feature4Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature4Reveal.isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
                } `}
            >
              <div className="w-16 h-16 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-6 text-yellow-500 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tactical Puzzles</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Sharpen your tactical vision with thousands of puzzles across all difficulty levels. Track your progress and rating.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Easy to Grandmaster levels
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Hints system available
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Themed tactical motifs
                </li>
              </ul>
            </div>

            <div
              ref={feature5Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature5Reveal.isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-10 scale-95'
                } `}
            >
              <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Position Analysis</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Import PGN, FEN, or analyze any position. Get deep engine evaluation, best moves, and complete game review.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  PGN/FEN import & export
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Opening identification
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Move navigation & history
                </li>
              </ul>
            </div>

            <div
              ref={feature6Reveal.ref}
              className={`group p-10 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-700 ${feature6Reveal.isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
                } `}
            >
              <div className="w-16 h-16 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 text-pink-500 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Beautiful Interface</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Modern, responsive design with dark/light themes. Works perfectly on desktop, tablet, and mobile devices.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Dark & light themes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Fully responsive design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Smooth animations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div
            ref={ctaReveal.ref}
            className={`max - w - 3xl mx - auto space - y - 6 transition - all duration - 1000 ${ctaReveal.isVisible
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
              } `}
          >
            <h2 className="text-4xl md:text-5xl font-bold">Ready to Level Up Your Chess?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of players improving their game with MonkChess
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/play">
                <Button size="lg" className="text-lg px-10 py-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  Start Playing Free
                </Button>
              </Link>
              <Link to="/analysis">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 hover:scale-105 transition-all">
                  Analyze a Position
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border hover:bg-muted hover:scale-110 transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border hover:bg-muted hover:scale-110 transition-all">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-background border hover:bg-muted hover:scale-110 transition-all">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="mailto:contact@chesswithmonk.com" className="p-2 rounded-full bg-background border hover:bg-muted hover:scale-110 transition-all">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} ChessWithMonk. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
