import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import logo from '../../images/logo/logo-djaitin-transparan.png';

type SidebarContext = ReturnType<typeof useSidebar> | null;

export default function AppLogo({
    className,
    logoClassName,
}: {
    className?: string;
    logoClassName?: string;
}) {
    // We use a try-catch or a check because AppLogo might be used outside of SidebarProvider
    const sidebar = useSidebarSafe();

    const isCollapsed = sidebar?.state === 'collapsed';

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <img
                src={logo}
                alt="Djaitin Logo"
                className={cn(
                    'object-contain transition-all duration-300',
                    isCollapsed ? 'h-8' : 'h-10',
                    logoClassName,
                )}
            />
            {!isCollapsed && (
                <span className="animate-in font-heading text-2xl leading-none font-bold tracking-wider text-[#2a6bb2] duration-500 fade-in dark:text-white">
                    DJAITIN
                </span>
            )}
        </div>
    );
}

function useSidebarSafe(): SidebarContext {
    try {
        return useSidebar();
    } catch {
        return null;
    }
}
