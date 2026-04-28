import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import logo from '../../images/logo/logo-djaitin-transparan.png';

export default function AppLogo({ className, logoClassName }: { className?: string; logoClassName?: string }) {
    // We use a try-catch or a check because AppLogo might be used outside of SidebarProvider
    let sidebar: any = null;
    try {
        sidebar = useSidebar();
    } catch (e) {
        // Not in a sidebar context
    }

    const isCollapsed = sidebar?.state === 'collapsed';

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <img
                src={logo}
                alt="Djaitin Logo"
                className={cn("transition-all duration-300 object-contain", isCollapsed ? "h-8" : "h-10", logoClassName)}
            />
            {!isCollapsed && (
                <span className="font-heading text-2xl leading-none font-bold tracking-wider text-[#2a6bb2] dark:text-white animate-in fade-in duration-500">
                    DJAITIN
                </span>
            )}
        </div>
    );
}
