export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    is_active: boolean;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type Flash = {
    success?: string | null;
    error?: string | null;
};

export type SharedPageProps = {
    name: string;
    auth: Auth;
    flash: Flash;
    sidebarOpen: boolean;
    unread_notifications_count: number;
    pending_transfer_count: number;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
