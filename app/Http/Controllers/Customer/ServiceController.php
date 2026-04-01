<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function tailor(Request $request): Response
    {
        return Inertia::render('Customer/Services/Tailor');
    }

    public function readyToWear(Request $request): Response
    {
        return Inertia::render('Customer/Services/ReadyToWear');
    }

    public function convection(Request $request): Response
    {
        return Inertia::render('Customer/Services/Convection');
    }
}
