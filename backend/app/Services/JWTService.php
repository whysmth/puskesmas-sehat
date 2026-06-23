<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class JWTService
{
    /**
     * Generate a new JWT token for a user.
     *
     * @param User $user
     * @return string
     */
    public static function generateToken(User $user): string
    {
        $secret = env('JWT_SECRET', 'simpus_jwt_secret_key_2026_secure');
        $expiresIn = env('JWT_EXPIRES_IN', '8h');
        
        // Parse expiry duration to seconds (default to 8h = 28800 seconds)
        $seconds = 28800;
        if (preg_match('/(\d+)([hmd])/', $expiresIn, $matches)) {
            $value = (int)$matches[1];
            $unit = $matches[2];
            switch ($unit) {
                case 'h':
                    $seconds = $value * 3600;
                    break;
                case 'm':
                    $seconds = $value * 60;
                    break;
                case 'd':
                    $seconds = $value * 86400;
                    break;
            }
        }

        $payload = [
            'iss' => env('APP_URL', 'http://localhost'),
            'sub' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + $seconds,
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    /**
     * Decode and validate a JWT token.
     *
     * @param string $token
     * @return object|null
     */
    public static function decodeToken(string $token): ?object
    {
        $secret = env('JWT_SECRET', 'simpus_jwt_secret_key_2026_secure');
        
        try {
            return JWT::decode($token, new Key($secret, 'HS256'));
        } catch (Exception $e) {
            return null;
        }
    }
}
