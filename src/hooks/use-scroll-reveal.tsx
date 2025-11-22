import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    delay?: number;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
    const { threshold = 0.1, rootMargin = '0px', delay = 0 } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    observer.unobserve(element);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold, rootMargin, delay]);

    return { ref, isVisible };
};
