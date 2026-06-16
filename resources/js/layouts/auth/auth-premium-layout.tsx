import { Link } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import heroImage from '../../../images/generated/catalog-hero-rtw.jpg';

export default function AuthPremiumLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[55%_45%]">
            {/* Left Side - Brand Showcase */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative hidden overflow-hidden bg-gradient-to-br from-[#123c78]/90 via-[#1e4a8f]/80 to-[#2a6bb2]/70 lg:flex"
            >
                {/* Image Background */}
                <div className="absolute inset-0">
                    <img
                        src={heroImage}
                        alt=""
                        className="h-full w-full object-cover"
                        aria-hidden="true"
                    />
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#123c78]/90 via-[#1e4a8f]/80 to-[#2a6bb2]/70" />
                {/* Decorative Light Orbs */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#ffd21f] blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo */}
                    <Link
                        href={home()}
                        className="flex items-center gap-3 transition-opacity hover:opacity-80"
                    >
                        <AppLogo logoClassName="h-12 brightness-0 invert" />
                    </Link>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-[#ffd21f]" />
                            <span className="text-sm font-medium">
                                Premium Fashion Experience
                            </span>
                        </div>

                        <h1 className="text-5xl font-bold leading-tight tracking-tight">
                            Craft Your
                            <br />
                            <span className="text-[#ffd21f]">Style Story</span>
                        </h1>

                        <p className="max-w-md text-lg leading-relaxed text-white/80">
                            Discover bespoke tailoring and ready-to-wear
                            collections designed exclusively for you.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3 pt-4">
                            {[
                                'Custom Tailoring',
                                'Premium Fabrics',
                                'Expert Craftsmanship',
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.5 + index * 0.1,
                                        duration: 0.4,
                                    }}
                                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm"
                                >
                                    {feature}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-sm text-white/60"
                    >
                        © 2024 Djaitin. All rights reserved.
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center justify-center bg-gradient-to-br from-[#f7f7f5] to-white p-6 sm:p-8 md:p-12"
            >
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="flex justify-center lg:hidden"
                    >
                        <AppLogo logoClassName="h-14" />
                    </Link>

                    {/* Header */}
                    <div className="space-y-3 text-center lg:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-[#123c78] sm:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-base text-[#123c78]/70">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Form Content */}
                    <div className="space-y-6">{children}</div>
                </div>
            </motion.div>
        </div>
    );
}
