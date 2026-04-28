<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Landing/Index', [
            'brand' => [
                'name' => 'Djaitin',
                'tagline' => 'Trusted convection partner for tailor custom, ready-to-wear, and bulk production.',
                'services' => [
                    'Tailor Custom',
                    'Ready-to-Wear',
                    'Bulk Convection',
                ],
            ],
        ]);
    }
}
