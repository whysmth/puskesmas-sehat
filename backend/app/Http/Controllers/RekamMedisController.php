<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\RekamMedis;
use App\Models\Resep;
use App\Models\ResepDetail;
use App\Models\Laboratorium;
use App\Models\Pembayaran;
use App\Models\TarifLayanan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class RekamMedisController extends Controller
{
    /**
     * Store a newly created rekam medis, along with optional prescriptions and lab orders.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kunjungan_id' => 'required|exists:kunjungans,id',
            'anamnesa' => 'required|string',
            'ttv' => 'required|array',
            'ttv.tensi' => 'required|string',
            'ttv.suhu' => 'required|string',
            'ttv.nadi' => 'required|string',
            'ttv.respirasi' => 'required|string',
            'ttv.berat_badan' => 'required|string',
            'ttv.tinggi_badan' => 'required|string',
            'diagnosa' => 'required|string',
            'kode_icd10' => 'nullable|string',
            'tindakan' => 'nullable|string',
            // Array of TarifLayanan IDs selected for actions
            'tarif_ids' => 'nullable|array',
            'tarif_ids.*' => 'exists:tarif_layanans,id',
            // Prescriptions array
            'resep' => 'nullable|array',
            'resep.*.obat_id' => 'required|exists:obats,id',
            'resep.*.jumlah' => 'required|integer|min:1',
            'resep.*.dosis' => 'required|string',
            'resep.*.aturan_pakai' => 'required|string',
            // Lab requests array of strings
            'lab_pemeriksaan' => 'nullable|array',
            'lab_pemeriksaan.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $kunjungan = Kunjungan::find($request->kunjungan_id);

        if ($kunjungan->status === 'selesai') {
            return response()->json([
                'status' => 'error',
                'message' => 'Kunjungan ini sudah selesai diperiksa.'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // 1. Create Rekam Medis
            $rekamMedis = RekamMedis::create([
                'kunjungan_id' => $request->kunjungan_id,
                'anamnesa' => $request->anamnesa,
                'ttv' => $request->ttv,
                'diagnosa' => $request->diagnosa,
                'kode_icd10' => $request->kode_icd10,
                'tindakan' => $request->tindakan,
                'dokter_id' => $request->user()->id
            ]);

            // 2. Process prescriptions if provided
            $totalObat = 0;
            if ($request->has('resep') && count($request->resep) > 0) {
                $resep = Resep::create([
                    'rekam_medis_id' => $rekamMedis->id,
                    'status' => 'baru'
                ]);

                foreach ($request->resep as $item) {
                    ResepDetail::create([
                        'resep_id' => $resep->id,
                        'obat_id' => $item['obat_id'],
                        'jumlah' => $item['jumlah'],
                        'dosis' => $item['dosis'],
                        'aturan_pakai' => $item['aturan_pakai']
                    ]);
                    
                    // Accumulate medicine cost for billing
                    $obat = \App\Models\Obat::find($item['obat_id']);
                    $totalObat += $obat->harga * $item['jumlah'];
                }
            }

            // 3. Process Lab orders if provided
            if ($request->has('lab_pemeriksaan') && count($request->lab_pemeriksaan) > 0) {
                foreach ($request->lab_pemeriksaan as $pemeriksaan) {
                    Laboratorium::create([
                        'rekam_medis_id' => $rekamMedis->id,
                        'jenis_pemeriksaan' => $pemeriksaan,
                        'status' => 'permintaan'
                    ]);
                }
            }

            // 4. Update visit status to 'selesai'
            $kunjungan->status = 'selesai';
            $kunjungan->save();

            // 5. Calculate action costs based on selected TarifLayanan
            $totalTindakan = 0;
            if ($request->has('tarif_ids') && count($request->tarif_ids) > 0) {
                $totalTindakan = TarifLayanan::whereIn('id', $request->tarif_ids)->sum('harga');
            }

            // 6. Update Pembayaran (Billing) record
            $pembayaran = Pembayaran::where('kunjungan_id', $kunjungan->id)->first();
            if ($pembayaran) {
                $pembayaran->total_tindakan = $totalTindakan;
                $pembayaran->total_obat = $totalObat;
                $pembayaran->total_bayar = $totalTindakan + $totalObat;
                
                // If patient uses BPJS, the billing status can be auto settled as lunas under BPJS method
                if ($kunjungan->pasien->jenis_pasien === 'bpjs') {
                    $pembayaran->metode_bayar = 'bpjs';
                    $pembayaran->status = 'lunas';
                }
                
                $pembayaran->save();
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Rekam medis berhasil disimpan.',
                'data' => RekamMedis::with(['resep.details.obat', 'laboratoriums'])->find($rekamMedis->id)
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan rekam medis: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get rekam medis for a specific kunjungan.
     */
    public function showByKunjungan($kunjungan_id)
    {
        $rm = RekamMedis::with(['resep.details.obat', 'laboratoriums', 'dokter'])
            ->where('kunjungan_id', $kunjungan_id)
            ->first();

        if (!$rm) {
            return response()->json([
                'status' => 'error',
                'message' => 'Rekam medis belum diisi.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $rm
        ]);
    }

    /**
     * Get historical medical records of a patient.
     */
    public function riwayat($pasien_id)
    {
        $rmList = RekamMedis::with(['kunjungan.poli', 'dokter', 'resep.details.obat', 'laboratoriums'])
            ->whereHas('kunjungan', function ($q) use ($pasien_id) {
                $q->where('pasien_id', $pasien_id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rmList
        ]);
    }
}
