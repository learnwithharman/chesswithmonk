import { motion, AnimatePresence } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AiOverlayProps {
    visible: boolean;
    text?: string;
}

export function AiOverlay({ visible, text = 'AI is thinking...' }: AiOverlayProps) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-card border border-border rounded-lg p-8 shadow-2xl"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                            >
                                <Brain className="w-16 h-16 text-primary" />
                            </motion.div>
                            <p className="text-lg font-semibold text-foreground">{text}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default AiOverlay;
