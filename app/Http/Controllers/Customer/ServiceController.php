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
}
