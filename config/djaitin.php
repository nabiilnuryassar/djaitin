<?php

return [
    'payment' => [
        'cash_proof_required_above' => env('DJAITIN_CASH_PROOF_THRESHOLD', 1_000_000),
        'bank_accounts' => [
            [
                'bank' => env('DJAITIN_BANK_PRIMARY_NAME', 'BCA'),
                'account_number' => env('DJAITIN_BANK_PRIMARY_NUMBER', '6045 8888 12'),
                'account_holder' => env('DJAITIN_BANK_PRIMARY_HOLDER', 'PT Djaitin Indonesia'),
                'branch' => env('DJAITIN_BANK_PRIMARY_BRANCH', 'KCU Bandung Asia Afrika'),
            ],
            [
                'bank' => env('DJAITIN_BANK_SECONDARY_NAME', 'Mandiri'),
                'account_number' => env('DJAITIN_BANK_SECONDARY_NUMBER', '130 0099 887766'),
                'account_holder' => env('DJAITIN_BANK_SECONDARY_HOLDER', 'PT Djaitin Indonesia'),
                'branch' => env('DJAITIN_BANK_SECONDARY_BRANCH', 'KCP Bandung Setiabudhi'),
            ],
        ],
        'transfer_notes' => [
            'Tulis nominal transfer sesuai total pesanan agar verifikasi cepat.',
            'Sertakan nomor order / payment di kolom berita transfer.',
            'Unggah bukti transfer di halaman ini setelah transaksi berhasil.',
        ],
        'support_contact' => [
            'name' => env('DJAITIN_SUPPORT_NAME', 'Tim Pembayaran Djaitin'),
            'whatsapp' => env('DJAITIN_SUPPORT_WHATSAPP', '+62 812 0000 0000'),
        ],
    ],
    'tailor' => [
        'minimum_dp_ratio' => env('DJAITIN_TAILOR_DP_RATIO', 0.5),
    ],
];
