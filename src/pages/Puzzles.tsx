import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Puzzle, Swords, BookOpen, Clock, Sparkles, Target, Zap, Trophy, ArrowRight, Home } from 'lucide-react';

export default function Puzzles() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full space-y-8 text-center relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon Header */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-purple-500 to-amber-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-700 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-card border border-border/80 rounded-3xl flex items-center justify-center shadow-2xl">
              <Puzzle className="w-12 h-12 sm:w-14 sm:h-14 text-primary animate-bounce duration-1000" />
            </div>
          </div>
        </div>

        {/* Status Badge & Main Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs sm:text-sm font-semibold text-primary shadow-sm">
            <Clock className="w-4 h-4 animate-spin duration-3000" />
            <span>Under Active Development</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Tactical Puzzles <span className="text-primary">Coming Soon</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            We are building an intelligent, adaptive tactical puzzle trainer powered by thousands of rating-matched chess puzzles.
          </p>
        </div>

        {/* Feature Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <Card className="bg-card/60 backdrop-blur-md border-border/80 hover:border-primary/40 transition-colors shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Adaptive Rating</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Puzzles dynamically matched to your skill level from 400 to 2500+ ELO.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-md border-border/80 hover:border-primary/40 transition-colors shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Thematic Tactics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter by motifs like Pins, Forks, Skewers, Discovered Attacks, and Mating Nets.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-md border-border/80 hover:border-primary/40 transition-colors shadow-sm">
            <CardContent className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Stockfish Explanations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instant move verification and engine analysis explaining why moves fail.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
          <Link to="/play">
            <Button size="lg" className="w-full sm:w-auto gap-2 px-6 shadow-md font-semibold">
              <Swords className="w-4 h-4" />
              Play Against AI
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/openings">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6 border-border/80 font-semibold">
              <BookOpen className="w-4 h-4 text-primary" />
              Explore Openings
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto gap-2 px-6 font-semibold text-muted-foreground hover:text-foreground">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
