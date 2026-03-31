export type LandingNavItem = {
    id: string;
    label: string;
    kicker: string;
};

export type LandingHeroCue = {
    start: number;
    end: number;
    align: 'left' | 'center' | 'right';
    eyebrow: string;
    title: string;
    description: string;
    badges: string[];
};

export type LandingServiceCard = {
    badge: string;
    title: string;
    description: string;
    highlights: string[];
    accentClassName: string;
};

export type LandingRoleSurface = {
    role: string;
    device: string;
    navStyle: string;
    headline: string;
    description: string;
    chips: string[];
};

export type LandingWorkflowLane = {
    label: string;
    gate: string;
    accentClassName: string;
    steps: string[];
};

export type LandingStat = {
    label: string;
    value: number;
    suffix?: string;
    description: string;
};

export type LandingFeatureStory = {
    title: string;
    description: string;
    badge: string;
};

export type LandingPersonaQuote = {
    role: string;
    label: string;
    quote: string;
    focus: string;
};
