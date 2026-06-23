<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KunjunganController extends Controller
{
    /**
     * Display a listing of visits (kunjungan).
     * Supports filtering by status, poli_id, and tgl_kunjungan.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $poliId = $request->query('poli_id');
        $tanggal = $request->query('tanggal', date('Y-m-d'));

        $query = Kunjungan::with(['pasien', 'poli']);

        if ($status) {
            $query->where('status', $status);
        }

        if ($poliId) {
            $query->where('poli_id', $poliId);
        }

        if ($tanggal) {
            $query->whereDate('tgl_kunjungan', $tanggal);
        }

        $kunjungans = $query->orderBy('no_antrian', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $kunjungans
        ]);
    }

    /**
     * Store a newly created visit (registration).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pasien_id' => 'required|exists:pasiens,id',
            'poli_id' => 'required|exists:polis,id',
            'tgl_kunjungan' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $tanggal = $request->tgl_kunjungan ?? date('Y-m-d');

        // Check if patient is already registered in the same clinic today
        $existing = Kunjungan::where('pasien_id', $request->pasien_id)
            ->where('poli_id', $request->poli_id)
            ->whereDate('tgl_kunjungan', $tanggal)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pasien sudah terdaftar di poli yang sama untuk hari ini.',
                'data' => $existing
            ], 400);
        }

        // Generate next queue number for this clinic and date
        $lastQueue = Kunjungan::where('poli_id', $request->poli_id)
            ->whereDate('tgl_kunjungan', $tanggal)
            ->max('no_antrian');

        $no_antrian = ($lastQueue) ? $lastQueue + 1 : 1;

        $kunjungan = Kunjungan::create([
            'pasien_id' => $request->pasien_id,
            'poli_id' => $request->poli_id,
            'tgl_kunjungan' => $tanggal,
            'no_antrian' => $no_antrian,
            'status' => 'menunggu'
        ]);

        // Auto create empty Pembayaran record to track billing
        Pembayaran::create([
            'kunjungan_id' => $kunjungan->id,
            'total_tindakan' => 0,
            'total_obat' => 0,
            'total_bayar' => 0,
            'metode_bayar' => 'tunai',
            'status' => 'belum_bayar'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kunjungan & Antrian berhasil didaftarkan.',
            'data' => Kunjungan::with(['pasien', 'poli'])->find($kunjungan->id)
        ], 201);
    }

    /**
     * Update the status of a visit.
     */
    public function updateStatus(Request $request, $id)
    {
        $kunjungan = Kunjungan::find($id);

        if (!$kunjungan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kunjungan tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:menunggu,diperiksa,selesai',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Status tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        $kunjungan->status = $request->status;
        $kunjungan->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status kunjungan berhasil diperbarui.',
            'data' => $kunjungan
        ]);
    }
}
