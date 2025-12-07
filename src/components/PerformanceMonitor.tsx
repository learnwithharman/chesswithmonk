import { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

export const PerformanceMonitor = () => {
    const [fps, setFps] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const requestRef = useRef<number>();

    useEffect(() => {
        const animate = (time: number) => {
            frameCount.current++;

            if (time - lastTime.current >= 1000) {
                setFps(Math.round((frameCount.current * 1000) / (time - lastTime.current)));
                frameCount.current = 0;
                lastTime.current = time;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    // Toggle with Ctrl+Shift+P
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                setIsVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-green-400 p-3 rounded-lg font-mono text-xs shadow-xl border border-green-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1 border-b border-green-900/50 pb-1">
                <Activity className="w-3 h-3" />
                <span className="font-bold">DEV MONITOR</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span>FPS:</span>
                <span className={fps < 30 ? 'text-red-500' : fps < 55 ? 'text-yellow-500' : 'text-green-400'}>
                    {fps}
                </span>
                <span>Memory:</span>
                <span>
                    {/* @ts-ignore */}
                    {performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 'N/A'}
                </span>
            </div>
        </div>
    );
};
