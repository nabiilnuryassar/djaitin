<?php

namespace App\Enums;

enum ProductionStage: string
{
    case Design = 'design';
    case Material = 'material';
    case Production = 'production';
    case QC = 'qc';
    case Packing = 'packing';
    case Shipping = 'shipping';
}
