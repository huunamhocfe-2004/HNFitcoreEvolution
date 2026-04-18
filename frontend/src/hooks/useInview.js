import { useEffect, useRef, useState } from 'react';

export default function useInview(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.2,
                ...options,
            }
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, [options]);

    return [ref, isVisible]
}