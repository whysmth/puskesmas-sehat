<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use App\Models\Kunjungan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PembayaranController extends Controller
{
    /**
     * Display payment details for a specific visit.
     */
    public function showByKunjungan($kunjungan_id)
    {
        $kunjungan = Kunjungan::with([
            'pasien',
            'poli',
            'rekamMedis.resep.details.obat',
            'rekamMedis.laboratoriums',
            'pembayaran'
        ])->find($kunjungan_id);

        if (!$kunjungan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kunjungan tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $kunjungan
        ]);
    }

    /**
     * Process payment for a visit.
     */
    public function bayar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'metode_bayar' => 'required|in:tunai,debit,bpjs',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $pembayaran = Pembayaran::where('kunjungan_id', $request->kunjungan_id)->first();

        if (!$pembayaran) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tagihan tidak ditemukan.'
            ], 404);
        }

        if ($pembayaran->status === 'lunas') {
            return response()->json([
                'status' => 'error',
                'message' => 'Tagihan ini sudah lunas dibayar.'
            ], 400);
        }

        $pembayaran->metode_bayar = $request->metode_bayar;
        $pembayaran->status = 'lunas';
        $pembayaran->kasir_id = $request->user()->id;
        $pembayaran->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Pembayaran berhasil diproses.',
            'data' => Pembayaran::with('kasir', 'kunjungan.pasien')->find($pembayaran->id)
        ]);
    }
}
