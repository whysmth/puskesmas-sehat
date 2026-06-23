<?php

namespace App\Http\Controllers;

use App\Models\Resep;
use App\Models\Obat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResepController extends Controller
{
    /**
     * Display a listing of prescriptions.
     * Supports filtering by status.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');

        $query = Resep::with([
            'rekamMedis.kunjungan.pasien',
            'rekamMedis.kunjungan.poli',
            'rekamMedis.dokter',
            'details.obat'
        ]);

        if ($status) {
            $query->where('status', $status);
        }

        $reseps = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $reseps
        ]);
    }

    /**
     * Dispense the prescription (reduce stock and mark as selesai).
     */
    public function serahkan($id)
    {
        $resep = Resep::with('details.obat')->find($id);

        if (!$resep) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resep tidak ditemukan.'
            ], 404);
        }

        if ($resep->status === 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Resep ini sudah diserahkan sebelumnya.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Check stock availability first for all items
            foreach ($resep->details as $detail) {
                $obat = $detail->obat;
                if ($obat->stok < $detail->jumlah) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Stok obat '{$obat->nama_obat}' tidak mencukupi. Tersedia: {$obat->stok}, dibutuhkan: {$detail->jumlah}."
                    ], 400);
                }
            }

            // Deduct stock for all items
            foreach ($resep->details as $detail) {
                $obat = $detail->obat;
                $obat->stok -= $detail->jumlah;
                $obat->save();
            }

            // Update prescription status
            $resep->status = 'selesai';
            $resep->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Resep berhasil diproses dan obat telah diserahkan.',
                'data' => Resep::with('details.obat')->find($resep->id)
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses resep: ' . $e->getMessage()
            ], 500);
        }
    }
}
