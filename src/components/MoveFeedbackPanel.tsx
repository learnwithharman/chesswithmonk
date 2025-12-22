import { memo } from 'react';
import { MoveQualityLabel, PVLine } from '@/lib/types';
import { formatEvaluation } from '@/lib/enginePipeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoveFeedbackPanelProps {
    moveQuality: MoveQualityLabel | null;
    evaluationDelta: number | null;
    contextualLabels: MoveQualityLabel[];
    currentMove: string | null;
    engineLines: PVLine[];
    multiPV: number;
}

const QUALITY_STYLES: Record<MoveQualityLabel, {
    bg: string;
    text: string;
    emoji: string;
}> = {
    'Brilliant': { bg: 'bg-cyan-500/10', text: 'text-cyan-600', emoji: '✨' },
    'Great': { bg: 'bg-blue-500/10', text: 'text-blue-600', emoji: '⭐' },
    'Excellent': { bg: 'bg-green-500/10', text: 'text-green-600', emoji: '✅' },
    'Best': { bg: 'bg-green-400/10', text: 'text-green-500', emoji: '•' },
    'Good': { bg: 'bg-gray-400/10', text: 'text-gray-600', emoji: '○' },
    'Inaccuracy': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', emoji: '⚠️' },
    'Mistake': { bg: 'bg-orange-500/10', text: 'text-orange-600', emoji: '🔸' },
    'Blunder': { bg: 'bg-red-500/10', text: 'text-red-600', emoji: '❌' },
    'Book Move': { bg: 'bg-purple-500/10', text: 'text-purple-600', emoji: '📖' },
    'Forced Move': { bg: 'bg-gray-500/10', text: 'text-gray-600', emoji: '🔒' },
    'Missed Win': { bg: 'bg-red-600/10', text: 'text-red-700', emoji: '⚠️' },
    'Missed Draw': { bg: 'bg-orange-600/10', text: 'text-orange-700', emoji: '⚠️' },
};

export const MoveFeedbackPanel = memo(function MoveFeedbackPanel({
    moveQuality,
    evaluationDelta,
    contextualLabels,
    currentMove,
    engineLines,
    multiPV,
}: MoveFeedbackPanelProps) {
    const style = moveQuality ? QUALITY_STYLES[moveQuality] : null;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm">Analysis Feedback</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {/* Move Quality Section */}
                {moveQuality && style && currentMove ? (
                    <div className={`${style.bg} rounded-lg p-3 border border-current/20`}>
                        <div className={`${style.text} space-y-2`}>
                            {/* Quality Label */}
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{style.emoji}</span>
                                <span className="font-bold text-base">{moveQuality}</span>
                            </div>

                            {/* Move notation */}
                            <div className="font-mono text-lg font-bold">
                                {currentMove}
                            </div>

                            {/* Evaluation delta */}
                            {evaluationDelta !== null && evaluationDelta !== 0 && (
                                <div className="text-sm opacity-80">
                                    {evaluationDelta > 0 ? '+' : ''}{evaluationDelta.toFixed(2)} advantage
                                </div>
                            )}

                            {/* Contextual labels */}
                            {contextualLabels.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-current/20">
                                    {contextualLabels.map((label, idx) => (
                                        <div key={idx} className="text-sm flex items-center gap-2">
                                            <span className="opacity-70">•</span>
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-sm text-muted-foreground py-4 opacity-50">
                        {engineLines.length > 0 ? 'Navigate through moves to see feedback' : 'Start analysis to see move feedback'}
                    </div>
                )}

                {/* Engine Best Moves Section */}
                {engineLines.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Engine Suggestions</h4>
                        <div className="space-y-1.5">
                            {engineLines.slice(0, multiPV).map((line, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center text-xs p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground font-mono w-4">{i + 1}.</span>
                                        <span className="font-mono font-bold">{line.moves[0]?.san || ''}</span>
                                    </div>
                                    <span
                                        className={
                                            line.evaluation > 0
                                                ? 'text-green-600 font-semibold'
                                                : 'text-red-600 font-semibold'
                                        }
                                    >
                                        {formatEvaluation(line.evaluation, line.mate)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
