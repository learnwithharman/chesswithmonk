import { memo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AnalysisProgressPopupProps {
    currentMove: number;
    totalMoves: number;
    visible: boolean;
}

export const AnalysisProgressPopup = memo(function AnalysisProgressPopup({
    currentMove,
    totalMoves,
    visible,
}: AnalysisProgressPopupProps) {
    if (!visible) return null;

    const percentage = totalMoves > 0 ? (currentMove / totalMoves) * 100 : 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border-2 border-primary rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <h3 className="font-bold text-xl">Analyzing Game...</h3>
                </div>

                {/* Progress info */}
                <div className="mb-4 text-muted-foreground">
                    Position <span className="font-mono font-bold text-foreground">{currentMove}</span> of{' '}
                    <span className="font-mono font-bold text-foreground">{totalMoves}</span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary/80"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="text-right text-sm text-muted-foreground mt-2">
                        {percentage.toFixed(0)}%
                    </div>
                </div>

                {/* Message */}
                <div className="text-center text-sm text-muted-foreground">
                    Please wait while the engine evaluates all positions...
                </div>
            </motion.div>
        </div>
    );
});
