import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import customer from '@/routes/customer';

type FloatingCartButtonProps = {
    itemCount?: number;
    isAnimating?: boolean;
};

export function FloatingCartButton({
    itemCount = 0,
    isAnimating = false,
}: FloatingCartButtonProps) {
    const [showPulse, setShowPulse] = useState(false);

    useEffect(() => {
        if (isAnimating) {
            setShowPulse(true);
            const timer = setTimeout(() => setShowPulse(false), 600);
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    if (itemCount === 0) {
        return null;
    }

    return (
        <Link
            href={customer.cart.index.url()}
            className="group fixed right-6 bottom-6 z-50 flex items-center gap-3"
        >
            {/* Badge */}
            {showPulse && (
                <div className="pointer-events-none absolute -top-2 -right-2 flex size-12 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-[#2563EB] opacity-75" />
                </div>
            )}

            {/* Button */}
            <div
                className={`relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1e40af] shadow-[0_8px_32px_rgba(37,99,235,0.4)] transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_12px_48px_rgba(37,99,235,0.5)] ${showPulse ? 'scale-110' : 'scale-100'}`}
            >
                <ShoppingCart className="size-6 text-white transition-transform duration-300 group-hover:scale-110" />

                {/* Item count badge */}
                <div
                    className={`absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#F9C11A] text-xs font-bold text-[#0F172A] shadow-lg transition-transform duration-300 ${showPulse ? 'scale-125' : 'scale-100'}`}
                >
                    {itemCount}
                </div>
            </div>
        </Link>
    );
}
