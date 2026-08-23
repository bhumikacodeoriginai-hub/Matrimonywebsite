<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Curated image sources
    |--------------------------------------------------------------------------
    | Keep visual sources in one place so approved, licensed local assets can
    | replace these development sources without touching Blade templates.
    */
    'hero' => [
        'desktop' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1800&h=1200&fit=crop&auto=format&q=85',
        'mobile' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&h=1200&fit=crop&auto=format&q=85',
        'alt' => 'Indian couple sharing a joyful moment in warm evening light',
        'video' => [
            // Development source: replace with a licensed local MP4/WebM in production.
            'mp4' => 'https://videos.pexels.com/video-files/853801/853801-hd_1920_1080_30fps.mp4',
            'poster' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1800&h=1200&fit=crop&auto=format&q=85',
            'description' => 'A quiet, cinematic moment of a couple walking together in warm light.',
            'captions' => '/media/hero-video-description.vtt',
        ],
    ],
    'communities' => [
        'general' => [
            'image' => 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1100&h=800&fit=crop&auto=format&q=82',
            'alt' => 'Indian couple walking together outdoors',
        ],
        'divyangjan' => [
            'image' => 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1100&h=800&fit=crop&auto=format&q=82',
            'alt' => 'Confident professional in a bright studio portrait',
        ],
        'hearing_speech' => [
            'image' => 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1100&h=800&fit=crop&auto=format&q=82',
            'alt' => 'Young professional communicating with warmth',
        ],
        'vitiligo' => [
            'image' => 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1100&h=800&fit=crop&auto=format&q=82',
            'alt' => 'Confident person smiling in natural light',
        ],
    ],
    'privacy' => [
        'image' => 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=900&fit=crop&auto=format&q=82',
        'alt' => 'Hands holding a phone beside a warm desk light',
    ],
    'stories' => [
        [
            'image' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&h=1100&fit=crop&auto=format&q=82',
            'alt' => 'Couple celebrating their wedding outdoors',
            'eyebrow' => 'A story of being seen',
            'quote' => 'The first conversation felt easy because we were both allowed to be ourselves.',
        ],
        [
            'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1100&fit=crop&auto=format&q=82',
            'alt' => 'Couple sharing a candid wedding moment',
            'eyebrow' => 'A story of patience',
            'quote' => 'We took our time, asked the right questions, and found something real.',
        ],
        [
            'image' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&h=1100&fit=crop&auto=format&q=82',
            'alt' => 'Couple smiling together at a family celebration',
            'eyebrow' => 'A story of belonging',
            'quote' => 'Our families found comfort in the care Advaita puts around every introduction.',
        ],
    ],
];
