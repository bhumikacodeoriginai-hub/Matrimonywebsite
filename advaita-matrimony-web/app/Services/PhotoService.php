<?php

namespace App\Services;

use App\Models\Photo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PhotoService
{
    /**
     * Upload and process a photo with watermark, blur, and thumbnail
     */
    public function uploadPhoto(UploadedFile $file, int $userId, bool $isPrimary = false): Photo
    {
        $filename = 'profile_' . $userId . '_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

        // Store original
        $originalPath = $file->storeAs("photos/{$userId}", $filename, 'public');

        // Generate watermarked version
        $watermarkedPath = $this->createWatermarkedVersion($originalPath, $userId);

        // Generate blurred version for privacy
        $blurredPath = $this->createBlurredVersion($originalPath, $userId);

        // Generate thumbnail
        $thumbnailPath = $this->createThumbnail($originalPath, $userId);

        // If setting as primary, remove primary from others
        if ($isPrimary) {
            Photo::where('user_id', $userId)->update(['is_primary' => false]);
        }

        return Photo::create([
            'user_id' => $userId,
            'original_path' => $originalPath,
            'watermarked_path' => $watermarkedPath,
            'blurred_path' => $blurredPath,
            'thumbnail_path' => $thumbnailPath,
            'is_primary' => $isPrimary,
            'privacy_level' => 'members_only',
            'status' => 'pending', // Requires admin approval
        ]);
    }

    /**
     * Create watermarked version with "Advaita Matrimony" text
     */
    private function createWatermarkedVersion(string $originalPath, int $userId): string
    {
        $fullPath = Storage::disk('public')->path($originalPath);
        $info = pathinfo($fullPath);
        $watermarkedFilename = $info['filename'] . '_wm.' . $info['extension'];
        $watermarkedPath = "photos/{$userId}/watermarked/{$watermarkedFilename}";

        // Ensure directory exists
        Storage::disk('public')->makeDirectory("photos/{$userId}/watermarked");

        // Using GD Library for watermarking
        $image = $this->loadImage($fullPath);
        if ($image) {
            $width = imagesx($image);
            $height = imagesy($image);

            // Add semi-transparent watermark text
            $textColor = imagecolorallocatealpha($image, 255, 255, 255, 80);
            $fontSize = max(12, (int)($width * 0.03));
            $text = config('app.watermark_text', 'Advaita Matrimony');

            // Diagonal watermark pattern
            for ($y = 0; $y < $height; $y += 150) {
                for ($x = -200; $x < $width; $x += 300) {
                    imagettftext($image, $fontSize, 30, $x, $y, $textColor, $this->getFontPath(), $text);
                }
            }

            $outputPath = Storage::disk('public')->path($watermarkedPath);
            $this->saveImage($image, $outputPath, $info['extension']);
            imagedestroy($image);
        }

        return $watermarkedPath;
    }

    /**
     * Create blurred version for privacy protection
     */
    private function createBlurredVersion(string $originalPath, int $userId): string
    {
        $fullPath = Storage::disk('public')->path($originalPath);
        $info = pathinfo($fullPath);
        $blurredFilename = $info['filename'] . '_blur.' . $info['extension'];
        $blurredPath = "photos/{$userId}/blurred/{$blurredFilename}";

        Storage::disk('public')->makeDirectory("photos/{$userId}/blurred");

        $image = $this->loadImage($fullPath);
        if ($image) {
            // Apply heavy Gaussian blur
            for ($i = 0; $i < 40; $i++) {
                imagefilter($image, IMG_FILTER_GAUSSIAN_BLUR);
            }

            $outputPath = Storage::disk('public')->path($blurredPath);
            $this->saveImage($image, $outputPath, $info['extension']);
            imagedestroy($image);
        }

        return $blurredPath;
    }

    /**
     * Create thumbnail
     */
    private function createThumbnail(string $originalPath, int $userId): string
    {
        $fullPath = Storage::disk('public')->path($originalPath);
        $info = pathinfo($fullPath);
        $thumbFilename = $info['filename'] . '_thumb.' . $info['extension'];
        $thumbPath = "photos/{$userId}/thumbnails/{$thumbFilename}";

        Storage::disk('public')->makeDirectory("photos/{$userId}/thumbnails");

        $image = $this->loadImage($fullPath);
        if ($image) {
            $width = imagesx($image);
            $height = imagesy($image);
            $thumbWidth = 200;
            $thumbHeight = (int)($height * ($thumbWidth / $width));

            $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($thumb, $image, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

            $outputPath = Storage::disk('public')->path($thumbPath);
            $this->saveImage($thumb, $outputPath, $info['extension']);
            imagedestroy($image);
            imagedestroy($thumb);
        }

        return $thumbPath;
    }

    private function loadImage(string $path)
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'jpg', 'jpeg' => imagecreatefromjpeg($path),
            'png' => imagecreatefrompng($path),
            'gif' => imagecreatefromgif($path),
            'webp' => imagecreatefromwebp($path),
            default => null,
        };
    }

    private function saveImage($image, string $path, string $ext): void
    {
        match (strtolower($ext)) {
            'jpg', 'jpeg' => imagejpeg($image, $path, 85),
            'png' => imagepng($image, $path),
            'gif' => imagegif($image, $path),
            'webp' => imagewebp($image, $path, 85),
            default => imagejpeg($image, $path, 85),
        };
    }

    private function getFontPath(): string
    {
        return public_path('fonts/arial.ttf');
    }
}
