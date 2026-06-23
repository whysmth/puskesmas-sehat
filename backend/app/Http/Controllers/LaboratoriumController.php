<?php

namespace App\Http\Controllers;

use App\Models\Laboratorium;
use App\Models\Pembayaran;
use App\Models\TarifLayanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LaboratoriumController extends Controller
{
    /**
     * Display a listing of laboratory requests.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = Laboratorium::with([
            'rekamMedis.kunjungan.pasien',
            'rekamMedis.kunjungan.poli',
            'rekamMedis.dokter'
        ]);

        if ($status) {
            $query->where('status', $status);
        }

        $labs = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $labs
        ]);
    }

    /**
     * Update laboratory request with test results.
     */
    public function updateHasil(Request $request, $id)
    {
        $lab = Laboratorium::find($id);

        if (!$lab) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permintaan pemeriksaan lab tidak ditemukan.'
            ], 404);
        }

        if ($lab->status === 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pemeriksaan lab ini sudah diisi hasilnya.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'hasil' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hasil pemeriksaan wajib diisi.',
                'errors' => $validator->errors()
            ], 422);
        }

        $lab->hasil = $request->hasil;
        $lab->status = 'selesai';
        $lab->save();

        // Dynamically add laboratory test fee to the patient's bill (Pembayaran)
        $kunjunganId = $lab->rekamMedis->kunjungan_id;
        $pembayaran = Pembayaran::where('kunjungan_id', $kunjunganId)->first();

        if ($pembayaran) {
            // Find corresponding tariff in database (e.g. 'Pemeriksaan Darah Lengkap (Lab)')
            $tariff = TarifLayanan::where('nama_layanan', 'like', '%' . $lab->jenis_pemeriksaan . '%')->first();
            $labCost = $tariff ? $tariff->harga : 30000.00; // default 30k if no matching tariff

            $pembayaran->total_tindakan += $labCost;
            $pembayaran->total_bayar += $labCost;
            $pembayaran->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Hasil pemeriksaan lab berhasil disimpan.',
            'data' => $lab
        ]);
    }
}
