<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JWTService;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Token tidak disediakan.'
            ], 401);
        }

        $token = substr($authHeader, 7); // Remove 'Bearer '
        $decoded = JWTService::decodeToken($token);

        if (!$decoded) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token tidak valid atau kedaluwarsa.'
            ], 401);
        }

        $user = User::find($decoded->sub);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengguna tidak ditemukan.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun Anda telah dinonaktifkan.'
            ], 401);
        }

        // Authenticate the user for the duration of the request
        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
