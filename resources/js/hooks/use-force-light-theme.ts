import { useLayoutEffect } from 'react';

export function useForceLightTheme(): void {
    useLayoutEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const root = document.documentElement;
        const previousDark = root.classList.contains('dark');
        const previousColorScheme = root.style.colorScheme;

        root.classList.remove('dark');
        root.style.colorScheme = 'light';

        return () => {
            root.classList.toggle('dark', previousDark);

            if (previousColorScheme.length > 0) {
                root.style.colorScheme = previousColorScheme;
            } else {
                root.style.removeProperty('color-scheme');
            }
        };
    }, []);
}
