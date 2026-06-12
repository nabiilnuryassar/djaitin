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

export type RecentNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    order_id: number | null;
    order_number: string | null;
    read_at: string | null;
    created_at: string | null;
};

export type BankAccount = {
    bank: string;
    account_number: string;
    account_holder: string;
    branch: string | null;
};

export type PaymentSupportContact = {
    name: string;
    whatsapp: string;
};

export type SharedPaymentInfo = {
    bank_accounts: BankAccount[];
    transfer_notes: string[];
    support_contact: PaymentSupportContact | null;
};

export type SharedPageProps = {
    name: string;
    auth: Auth;
    flash: Flash;
    sidebarOpen: boolean;
    unread_notifications_count: number;
    recent_notifications: RecentNotification[];
    pending_transfer_count: number;
    payment: SharedPaymentInfo;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
