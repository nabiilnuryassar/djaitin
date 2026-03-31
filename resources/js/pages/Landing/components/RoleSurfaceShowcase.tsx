import { Badge } from '@/components/ui/badge';
import type { LandingRoleSurface } from '../types';

type RoleSurfaceShowcaseProps = {
    surfaces: LandingRoleSurface[];
};

export function RoleSurfaceShowcase({ surfaces }: RoleSurfaceShowcaseProps) {
    return (
        <div className="grid gap-6 xl:grid-cols-2">
            {surfaces.map((surface, index) => (
                <article
                    className="group overflow-hidden rounded-[2rem] border border-white/10 bg-[#211f39] p-6 text-white shadow-[0_40px_120px_rgba(11,10,27,0.45)]"
                    key={surface.role}
                >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-[var(--landing-accent)] uppercase">
                                {surface.device}
                            </p>
                            <h3 className="mt-3 [font-family:var(--landing-heading-font)] text-2xl font-semibold">
                                {surface.role}
                            </h3>
                        </div>
                        <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white">
                            {surface.navStyle}
                        </Badge>
                    </div>
                    <p className="mt-4 text-lg text-white/90">
                        {surface.headline}
                    </p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                        {surface.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {surface.chips.map((chip) => (
                            <Badge
                                className="rounded-full bg-white/8 px-3 py-1 text-white/85"
                                key={chip}
                                variant="secondary"
                            >
                                {chip}
                            </Badge>
                        ))}
                    </div>
                    <div className="mt-8 rounded-[1.75rem] border border-white/12 bg-white/5 p-4">
                        <div className="flex items-center justify-between rounded-[1.35rem] border border-white/8 bg-white/8 px-4 py-3">
                            <span className="text-sm text-white/70">
                                Surface {index + 1}
                            </span>
                            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                                Live workflow
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-[1.25rem] border border-white/8 bg-[#2E2A4C] p-4">
                                <div className="h-2 w-14 rounded-full bg-[var(--landing-accent)]" />
                                <div className="mt-4 space-y-2">
                                    <div className="h-2 rounded-full bg-white/15" />
                                    <div className="h-2 w-3/4 rounded-full bg-white/10" />
                                </div>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/8 bg-[#2A2745] p-4">
                                <div className="h-16 rounded-[1rem] border border-dashed border-white/10 bg-white/5" />
                                <div className="mt-3 h-2 w-2/3 rounded-full bg-white/15" />
                            </div>
                            <div className="rounded-[1.25rem] border border-white/8 bg-[#27233F] p-4">
                                <div className="space-y-2">
                                    <div className="h-7 rounded-full bg-indigo-400/20" />
                                    <div className="h-7 rounded-full bg-white/10" />
                                    <div className="h-7 rounded-full bg-white/10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
