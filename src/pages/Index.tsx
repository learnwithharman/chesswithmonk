import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Swords, BookOpen, ArrowRight, Brain, Trophy, Search, Globe, BookMarked, ShieldCheck, Cpu, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import ShapeGrid from '@/components/ShapeGrid';
import ParticleText from '@/components/ParticleText';
import { Instagram, Github, Linkedin, Mail } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const Index = () => {
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 md:py-24 relative overflow-hidden">
        {/* Animated Interactive Grid Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <ShapeGrid
            shape="square"
            speed={0.3}
            direction="up"
            squareSize={60}
            borderColor="rgba(160, 110, 70, 0.45)"
            hoverFillColor="rgba(180, 125, 75, 0.65)"
            hoverTrailAmount={8}
            className="w-full h-full opacity-100"
          />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-5xl space-y-6 md:space-y-8 animate-in fade-in duration-700 w-full">
          {/* Logo Badge */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
              <div className="relative w-20 h-20 md:w-28 md:h-28 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-xl">
                <Logo className="w-10 h-10 md:w-14 md:h-14 text-primary" />
              </div>
            </div>
          </div>

          {/* Main Interactive Particle Tagline */}
          <div className="space-y-3 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border/80 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Chess Platform</span>
            </div>
            
            {/* Particle Interactive Title */}
            <div className="w-full max-w-5xl h-52 sm:h-64 md:h-80 my-2">
              <ParticleText
                text={`Master Chess with\nMonkChess`}
                color="#ffffff"
                highlightColor="#9d4edd"
                particleSize={2.4}
                density={3}
                scatter={120}
                gatherDuration={1500}
                pointerRepel={40}
                repelRadius={120}
                idleDrift={0.6}
                fontSize="clamp(3.2rem, 8vw, 6.2rem)"
                fontWeight={900}
              />
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
            Powered by <span className="font-semibold text-foreground">Stockfish 17</span>, the world's standard in chess engines.
            Play against human-like AI, explore 10,000+ ECO openings, solve puzzles, and analyze your games.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 md:pt-6 w-full sm:w-auto px-4 sm:px-0">
            <Link to="/play" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 py-6 gap-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all group font-semibold">
                <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Play Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/openings" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-8 py-6 gap-2.5 border-border/80 hover:bg-secondary hover:scale-[1.02] transition-all font-semibold">
                <BookOpen className="w-5 h-5 text-primary" />
                Explore Openings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics & Highlights Section */}
      <section className="py-10 bg-card/60 border-y border-border/80 backdrop-blur-sm">
        <div
          ref={statsReveal.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${statsReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-extrabold text-primary mb-1">10,000+</div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground">ECO Openings Library</div>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-extrabold text-amber-400 mb-1">Stockfish 17</div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground">World-Class Engine</div>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-extrabold text-purple-400 mb-1">∞</div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground">Tactical Puzzles</div>
            </div>
            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">100%</div>
              <div className="text-xs md:text-sm font-medium text-muted-foreground">Free & Open Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div
            ref={featuresHeaderReveal.ref}
            className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-700 ${featuresHeaderReveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Everything You Need to Master Chess</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Designed for serious chess players. Fast, focused, and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div
              ref={feature1Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature1Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center mb-6 text-primary">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Stockfish 17 Engine</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Get real-time move suggestions with multiple best lines, depth control, and centipawn evaluations directly in browser.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary" /> Multi-PV evaluation lines
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Real-time position scoring
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div
              ref={feature2Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature2Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center mb-6 text-emerald-400">
                  <BookMarked className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">10,000+ Openings Database</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Master classic & modern ECO opening lines with automatic side detection, theory notes, and interactive practice drills.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ECO opening identification
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Interactive line learning
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div
              ref={feature3Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature3Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mb-6 text-amber-400">
                  <Swords className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Human-Like AI Opponents</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Play matches against realistic engine difficulties from Beginner (800 ELO) to Advanced (2200+ ELO).
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 4 tailored difficulty tiers
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Hints & undo support
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div
              ref={feature4Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature4Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Tactical Puzzles</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Sharpen your tactical intuition with thousands of thematic puzzles covering pins, forks, double attacks, and checkmates.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Tactical rating progress
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Instant solution verification
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div
              ref={feature5Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature5Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center mb-6 text-blue-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">PGN & FEN Analysis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Import PGN games or FEN strings. Analyze position sub-variations, review mistakes, and export PGN notation.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Full PGN import / export
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Deep move navigation
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div
              ref={feature6Reveal.ref}
              className={`p-8 rounded-xl bg-card border border-border/80 shadow-lg hover:border-primary/50 transition-all duration-500 flex flex-col justify-between ${feature6Reveal.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <div>
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center mb-6 text-rose-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">Responsive Dark Theme</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Optimized for desktop, tablet, and mobile browsers with crisp vector pieces and smooth 180ms move animations.
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-muted-foreground border-t border-border/50 pt-4">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Fluid responsive layout
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Fast offline web worker support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-background via-card/50 to-background border-t border-border/80">
        <div className="container mx-auto px-4 text-center">
          <div
            ref={ctaReveal.ref}
            className={`max-w-2xl mx-auto space-y-6 transition-all duration-700 ${ctaReveal.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to Level Up Your Game?</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Start playing or analyze positions immediately with MonkChess.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/play">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 shadow-lg shadow-primary/20 font-semibold">
                  Start Playing Free
                </Button>
              </Link>
              <Link to="/analysis">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-border/80 font-semibold">
                  Analyze Position
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border/80">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center gap-4">
            <a href="https://www.instagram.com/reekursive/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background border border-border/60 hover:text-primary transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://github.com/learnwithharman" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background border border-border/60 hover:text-primary transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/harman-068394327?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-background border border-border/60 hover:text-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="mailto:v1ntage.monk69@gmail.com" className="p-2 rounded-lg bg-background border border-border/60 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ChessWithMonk. Built for chess enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

