import { usePage } from '@inertiajs/react';
import { CheckCircle2, Copy, Landmark } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { BankAccount, SharedPageProps } from '@/types/auth';

type BankAccountPanelProps = {
    className?: string;
    compact?: boolean;
    title?: string;
};

export default function BankAccountPanel({
    className = '',
    compact = false,
    title = 'Rekening tujuan transfer',
}: BankAccountPanelProps) {
    const { payment } = usePage<SharedPageProps>().props;

    if (payment.bank_accounts.length === 0) {
        return null;
    }

    return (
        <section
            className={`overflow-hidden rounded-[1.75rem] border border-[#DBEAFE] bg-gradient-to-br from-white via-white to-[#EFF4FF] shadow-[0_16px_50px_rgba(37,99,235,0.07)] ${className}`}
        >
            <div className="border-b border-[#DBEAFE] p-5 md:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF4FF] text-[#1B5EC5]">
                        <Landmark className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.22em] text-[#2563EB] uppercase">
                            Transfer bank
                        </p>
                        <h3 className="mt-1 [font-family:var(--font-heading)] text-2xl font-semibold tracking-tight text-[#0F172A]">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Gunakan salah satu rekening resmi Djaitin berikut,
                            lalu unggah bukti transfer agar pembayaran bisa
                            diverifikasi kasir.
                        </p>
                    </div>
                </div>
            </div>

            <div
                className={`grid gap-3 p-5 md:p-6 ${compact ? '' : 'md:grid-cols-2'}`}
            >
                {payment.bank_accounts.map((account) => (
                    <BankAccountCard
                        account={account}
                        key={account.account_number}
                    />
                ))}
            </div>

            {payment.transfer_notes.length > 0 && !compact && (
                <div className="border-t border-[#DBEAFE] bg-white/62 px-5 py-4 md:px-6">
                    <div className="grid gap-2 text-sm leading-6 text-slate-600">
                        {payment.transfer_notes.map((note) => (
                            <div className="flex items-start gap-2" key={note}>
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#1B5EC5]" />
                                <span>{note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

function BankAccountCard({ account }: { account: BankAccount }) {
    const [copied, setCopied] = useState(false);

    const copyAccountNumber = async () => {
        if (!navigator.clipboard) {
            return;
        }

        await navigator.clipboard.writeText(
            account.account_number.replace(/\s/g, ''),
        );
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <article className="rounded-[1.35rem] border border-[#DBEAFE] bg-white p-4 shadow-[0_12px_34px_rgba(37,99,235,0.05)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#2563EB] uppercase">
                        {account.bank}
                    </p>
                    <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[#0F172A]">
                        {account.account_number}
                    </p>
                </div>
                <Button
                    className="rounded-full border-[#DBEAFE] bg-white text-[#1B5EC5] hover:bg-[#EFF4FF] hover:text-[#1B5EC5]"
                    onClick={copyAccountNumber}
                    size="sm"
                    type="button"
                    variant="outline"
                >
                    <Copy className="size-4" />
                    {copied ? 'Disalin' : 'Salin'}
                </Button>
            </div>
            <div className="mt-4 rounded-2xl bg-[#F8FAFC] p-3 text-sm leading-6 text-slate-600">
                <p>
                    A.n.{' '}
                    <span className="font-semibold text-[#0F172A]">
                        {account.account_holder}
                    </span>
                </p>
                {account.branch && <p>Cabang: {account.branch}</p>}
            </div>
        </article>
    );
}
