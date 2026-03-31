<?php

use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the landing page', function () {
    $response = $this->get(route('home'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->where('auth.user', null)
        );
});
