import AuthPremiumLayout from '@/layouts/auth/auth-premium-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <AuthPremiumLayout title={title} description={description} {...props}>
            {children}
        </AuthPremiumLayout>
    );
}
