import { memo } from 'react';
import { cn } from '@/lib/utils';

interface EvaluationBarProps {
    evaluation: number; // Normalized evaluation (-10 to +10, or ±15 for mate)
    mateIn: number | null; // Mate in N moves (null if not mate)
    isSmoothing?: boolean; // Enable smooth transitions
    perspective?: 'w' | 'b'; // Current perspective
    className?: string;
}

export const EvaluationBar = memo(function EvaluationBar({
    evaluation,
    mateIn,
    isSmoothing = true,
    perspective = 'w',
    className,
}: EvaluationBarProps) {
    // Calculate bar height (0-100%)
    // White advantage = top portion fills (white)
    // Black advantage = bottom portion fills (black)
    const clampedEval = Math.max(-15, Math.min(15, evaluation));
    const barHeight = ((clampedEval + 15) / 30) * 100;

    // Format display text
    let displayText: string;
    if (mateIn !== null) {
        displayText = `M${Math.abs(mateIn)}`;
    } else {
        const absEval = Math.abs(evaluation);
        const sign = evaluation >= 0 ? '+' : '';
        displayText = `${sign}${evaluation.toFixed(1)}`;
    }

    // Determine text color for contrast
    const isTopHalf = barHeight > 50;
    const textColorClass = mateIn !== null
        ? 'text-yellow-900'
        : isTopHalf
            ? 'text-gray-900'
            : 'text-white';

    return (
        <div className={cn('relative flex flex-col rounded-sm overflow-hidden shadow-lg', className)}>
            {/* White portion (top) */}
            <div
                className={cn(
                    'w-full bg-white transition-all',
                    isSmoothing && !mateIn ? 'duration-500 ease-out' : 'duration-200'
                )}
                style={{ height: `${barHeight}%` }}
            />

            {/* Black portion (bottom) */}
            <div
                className={cn(
                    'w-full bg-gray-900 transition-all',
                    isSmoothing && !mateIn ? 'duration-500 ease-out' : 'duration-200'
                )}
                style={{ height: `${100 - barHeight}%` }}
            />

            {/* Evaluation text overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className={cn(
                        'text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded shadow-sm',
                        textColorClass,
                        mateIn !== null
                            ? 'bg-yellow-400'
                            : isTopHalf
                                ? 'bg-white/95'
                                : 'bg-gray-900/95'
                    )}
                >
                    {displayText}
                </div>
            </div>

            {/* Center line indicator */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-400/40 pointer-events-none transform -translate-y-1/2" />
        </div>
    );
});
