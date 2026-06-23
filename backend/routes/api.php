<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PoliController;
use App\Http\Controllers\PasienController;
use App\Http\Controllers\KunjunganController;
use App\Http\Controllers\RekamMedisController;
use App\Http\Controllers\ObatController;
use App\Http\Controllers\ResepController;
use App\Http\Controllers\LaboratoriumController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\DashboardController;

// 1. Status Check
Route::get('/status', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'SIMPUS API is running smoothly',
    ]);
});

// 2. Authentication Routes
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// 3. Protected Business Logic Routes
Route::middleware('jwt')->group(function () {
    
    // --- Poli clinic routes (Read access for all authenticated users)
    Route::get('/poli', [PoliController::class, 'index']);
    Route::get('/tarif-layanan', function () {
        return response()->json([
            'status' => 'success',
            'data' => \App\Models\TarifLayanan::all()
        ]);
    });

    // --- Pasien routes (Pendaftaran, Admin, Dokter)
    Route::middleware('role:pendaftaran,admin,dokter')->group(function () {
        Route::get('/pasien', [PasienController::class, 'index']);
        Route::post('/pasien', [PasienController::class, 'store']);
        Route::get('/pasien/{id}', [PasienController::class, 'show']);
        Route::put('/pasien/{id}', [PasienController::class, 'update']);
    });

    // --- Kunjungan / Antrian routes
    // Pendaftaran & Admin can register/list visits. Dokter & Kasir also need to list visits to see their queues.
    Route::middleware('role:pendaftaran,admin,dokter,kasir,kepala')->group(function () {
        Route::get('/kunjungan', [KunjunganController::class, 'index']);
    });
    Route::middleware('role:pendaftaran,admin')->group(function () {
        Route::post('/kunjungan', [KunjunganController::class, 'store']);
    });
    // Doctor & Pendaftaran & Admin can update status of visits
    Route::middleware('role:dokter,pendaftaran,admin')->group(function () {
        Route::put('/kunjungan/{id}/status', [KunjunganController::class, 'updateStatus']);
    });

    // --- Rekam Medis routes (Dokter writes, Dokter/Pendaftaran/Admin/Kepala reads)
    Route::middleware('role:dokter')->group(function () {
        Route::post('/rekam-medis', [RekamMedisController::class, 'store']);
    });
    Route::middleware('role:dokter,admin,pendaftaran,kepala')->group(function () {
        Route::get('/rekam-medis/kunjungan/{kunjungan_id}', [RekamMedisController::class, 'showByKunjungan']);
        Route::get('/rekam-medis/riwayat/{pasien_id}', [RekamMedisController::class, 'riwayat']);
    });

    // --- Laboratorium routes (Laboran writes/reads, Dokter/Admin reads)
    Route::middleware('role:laboran,admin,dokter')->group(function () {
        Route::get('/laboratorium', [LaboratoriumController::class, 'index']);
    });
    Route::middleware('role:laboran')->group(function () {
        Route::put('/laboratorium/{id}/hasil', [LaboratoriumController::class, 'updateHasil']);
    });

    // --- Obat (Medicine Inventory) routes
    // Apoteker & Admin have full CRUD. Others can read only to view list (e.g. Dokter to write prescriptions).
    Route::middleware('role:apoteker,admin,dokter')->group(function () {
        Route::get('/obat', [ObatController::class, 'index']);
    });
    Route::middleware('role:apoteker,admin')->group(function () {
        Route::post('/obat', [ObatController::class, 'store']);
        Route::get('/obat/{id}', [ObatController::class, 'show']);
        Route::put('/obat/{id}', [ObatController::class, 'update']);
        Route::put('/obat/{id}/stok', [ObatController::class, 'updateStok']);
        Route::delete('/obat/{id}', [ObatController::class, 'destroy']);
    });

    // --- Resep routes (Apoteker manages, Dokter can read)
    Route::middleware('role:apoteker,admin,dokter')->group(function () {
        Route::get('/resep', [ResepController::class, 'index']);
    });
    Route::middleware('role:apoteker')->group(function () {
        Route::put('/resep/{id}/serahkan', [ResepController::class, 'serahkan']);
    });

    // --- Kasir (Billing/Payments) routes (Kasir has write, Admin/Kepala has read)
    Route::middleware('role:kasir,admin,kepala')->group(function () {
        Route::get('/pembayaran/kunjungan/{kunjungan_id}', [PembayaranController::class, 'showByKunjungan']);
    });
    Route::middleware('role:kasir')->group(function () {
        Route::post('/pembayaran/bayar', [PembayaranController::class, 'bayar']);
    });

    // --- Dashboard & Laporan (Admin, Kepala Puskesmas / Pimpinan have access)
    Route::middleware('role:admin,kepala')->group(function () {
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/laporan/kunjungan', [DashboardController::class, 'laporanKunjungan']);
        Route::get('/laporan/penyakit-terbanyak', [DashboardController::class, 'laporanPenyakit']);
        Route::get('/laporan/stok-obat', [DashboardController::class, 'laporanStokObat']);
        Route::get('/laporan/keuangan', [DashboardController::class, 'laporanKeuangan']);
    });

    // --- User Management (Admin only)
    Route::middleware('role:admin')->group(function () {
        Route::get('/users', function() {
            return response()->json([
                'status' => 'success',
                'data' => \App\Models\User::all()
            ]);
        });
        Route::post('/users', function(\Illuminate\Http\Request $request) {
            $data = $request->validate([
                'nama' => 'required|string|max:255',
                'username' => 'required|string|unique:users,username|max:50',
                'password' => 'required|string|min:6',
                'role' => 'required|in:admin,pendaftaran,dokter,apoteker,laboran,kasir,kepala',
            ]);
            $data['password'] = bcrypt($data['password']);
            $user = \App\Models\User::create($data);
            return response()->json([
                'status' => 'success',
                'data' => $user
            ], 201);
        });
        Route::put('/users/{id}/status', function(\Illuminate\Http\Request $request, $id) {
            $user = \App\Models\User::findOrFail($id);
            $user->status = $user->status === 'active' ? 'inactive' : 'active';
            $user->save();
            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        });
    });
});
