<?php

namespace App\Enums;

enum OrderType: string
{
    case Tailor = 'tailor';
    case ReadyWear = 'ready_wear';
    case Convection = 'convection';
}
