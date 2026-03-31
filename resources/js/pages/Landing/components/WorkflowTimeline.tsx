import type { LandingWorkflowLane } from '../types';

type WorkflowTimelineProps = {
    lanes: LandingWorkflowLane[];
};

export function WorkflowTimeline({ lanes }: WorkflowTimelineProps) {
    return (
        <div className="grid gap-5 xl:grid-cols-3">
            {lanes.map((lane) => (
                <article
                    className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                    key={lane.label}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.24em] text-white/45 uppercase">
                                Workflow
                            </p>
                            <h3 className="mt-3 [font-family:var(--landing-heading-font)] text-2xl font-semibold text-white">
                                {lane.label}
                            </h3>
                        </div>
                        <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${lane.accentClassName}`}
                        >
                            {lane.gate}
                        </span>
                    </div>
                    <div className="mt-8 space-y-5">
                        {lane.steps.map((step, index) => (
                            <div className="flex gap-4" key={step}>
                                <div className="flex flex-col items-center">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[var(--landing-primary)] text-sm font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    {index < lane.steps.length - 1 ? (
                                        <div className="mt-2 h-12 w-px bg-gradient-to-b from-[var(--landing-primary)] to-transparent" />
                                    ) : null}
                                </div>
                                <div className="pt-2">
                                    <p className="text-sm leading-6 text-white/72">
                                        {step}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            ))}
        </div>
    );
}
