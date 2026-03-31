import Lenis from 'lenis';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

type LenisProviderProps = {
    children: ReactNode;
};

export function LenisProvider({ children }: LenisProviderProps) {
    useEffect(() => {
        const lenis = new Lenis({
            autoRaf: true,
            anchors: true,
            lerp: 0.08,
            smoothWheel: true,
            syncTouch: false,
        });

        return () => {
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
