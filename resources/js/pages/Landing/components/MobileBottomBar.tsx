import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Home, Layers, GitBranch, LogIn, LayoutDashboard, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

type MobileBottomBarProps = {
    actionHref: NonNullable<InertiaLinkProps['href']>;
    actionLabel: string;
    onNavigate: (sectionId: string) => void;
};

export function MobileBottomBar({
    actionHref,
    actionLabel,
    onNavigate,
}: MobileBottomBarProps) {
    const [activeSection, setActiveSection] = useState('hero');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'services', 'workflow', 'cta'];
            let current = 'hero';
            
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Jika elemen terlihat di atas atau setengah tengah viewport
                    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 3) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigate = (sectionId: string) => {
        setActiveSection(sectionId);
        onNavigate(sectionId);
    };

    const navItems = [
        { id: 'hero', icon: Home, label: 'Beranda' },
        { id: 'services', icon: Layers, label: 'Layanan' },
        { id: 'workflow', icon: GitBranch, label: 'Alur' },
    ];

    return (
        <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] md:hidden"
            initial={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/50 bg-white/75 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/5 backdrop-blur-xl">
                
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = item.icon;
                    
                    return (
                        <button
                            className={cn(
                                "group relative flex h-12 w-12 flex-col items-center justify-center rounded-full transition-colors duration-300",
                                isActive ? "text-[#2563EB]" : "text-[#64748B] hover:text-[#0F172A]"
                            )}
                            key={item.id}
                            onClick={() => handleNavigate(item.id)}
                            type="button"
                            aria-label={item.label}
                        >
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-[#EFF4FF]"
                                    layoutId="mobile-nav-active-bubble"
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                            )}
                            <div className="relative z-10 flex flex-col items-center justify-center">
                                <Icon className={cn("size-5 transition-transform group-hover:scale-110", isActive && "fill-[#DBEAFE]/50")} />
                            </div>
                        </button>
                    );
                })}

                <div className="mx-1 h-8 w-px bg-slate-200/60" />

                <button
                    className="relative ml-1 flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#162044] px-4 font-semibold text-white shadow-md transition-transform active:scale-95"
                    onClick={() => handleNavigate('cta')}
                    type="button"
                >
                    <Sparkles className="size-4 text-[#F9C11A]" />
                    <span className="pr-1 text-sm font-semibold tracking-tight">Demo</span>
                </button>

                <div className="mx-1 h-8 w-px bg-slate-200/60" />

                <Link
                    className="group relative flex h-12 w-12 flex-col items-center justify-center rounded-full text-[#64748B] transition-colors hover:text-[#0F172A]"
                    href={actionHref}
                    aria-label={actionLabel}
                >
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        {actionLabel === 'Dashboard' ? (
                            <LayoutDashboard className="size-5 transition-transform group-hover:scale-110" />
                        ) : (
                            <LogIn className="size-5 transition-transform group-hover:scale-110" />
                        )}
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}
