<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Kasir = 'kasir';
    case Produksi = 'produksi';
    case Admin = 'admin';
    case Owner = 'owner';
}
