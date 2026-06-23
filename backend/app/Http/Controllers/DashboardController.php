<?php

namespace App\Http\Controllers;

use App\Models\Kunjungan;
use App\Models\Obat;
use App\Models\Pembayaran;
use App\Models\RekamMedis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get statistics for the dashboard dashboard.
     */
    public function stats()
    {
        $today = date('Y-m-d');
        $startOfMonth = date('Y-m-01');

        // 1. Kunjungan hari ini
        $kunjunganHariIni = Kunjungan::whereDate('tgl_kunjungan', $today)->count();

        // 2. Kunjungan bulan ini
        $kunjunganBulanIni = Kunjungan::whereDate('tgl_kunjungan', '>=', $startOfMonth)->count();

        // 3. Obat stok menipis (< 20)
        $obatKritis = Obat::where('stok', '<', 20)->count();

        // 4. Pendapatan hari ini (lunas)
        $pendapatanHariIni = Pembayaran::where('status', 'lunas')
            ->whereDate('updated_at', $today)
            ->sum('total_bayar');

        // 5. Antrian saat ini per poli (menunggu/diperiksa)
        $antrianAktif = Kunjungan::with(['pasien', 'poli'])
            ->whereDate('tgl_kunjungan', $today)
            ->whereIn('status', ['menunggu', 'diperiksa'])
            ->orderBy('no_antrian', 'asc')
            ->get();

        // 6. 5 Kunjungan Terakhir
        $recentVisits = Kunjungan::with(['pasien', 'poli'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'kunjungan_hari_ini' => $kunjunganHariIni,
                'kunjungan_bulan_ini' => $kunjunganBulanIni,
                'obat_kritis' => $obatKritis,
                'pendapatan_hari_ini' => (float) $pendapatanHariIni,
                'antrian_aktif' => $antrianAktif,
                'recent_visits' => $recentVisits
            ]
        ]);
    }

    /**
     * Get visits report grouped by clinic and date.
     */
    public function laporanKunjungan(Request $request)
    {
        $periode = $request->query('periode', 'bulan'); // bulan, tahun

        if ($periode === 'tahun') {
            $visits = Kunjungan::select(
                DB::raw('MONTH(tgl_kunjungan) as label'),
                DB::raw('count(*) as total')
            )
            ->whereYear('tgl_kunjungan', date('Y'))
            ->groupBy('label')
            ->orderBy('label', 'asc')
            ->get();
            
            // Format month numbers to Indonesian month names
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            $formatted = collect(range(1, 12))->map(function($m) use ($visits, $months) {
                $found = $visits->firstWhere('label', $m);
                return [
                    'label' => $months[$m - 1],
                    'total' => $found ? $found->total : 0
                ];
            });
        } else {
            // Default: Last 10 days
            $visits = Kunjungan::select(
                DB::raw('DATE_FORMAT(tgl_kunjungan, "%d/%m") as label'),
                DB::raw('count(*) as total')
            )
            ->where('tgl_kunjungan', '>=', now()->subDays(10))
            ->groupBy('tgl_kunjungan')
            ->orderBy('tgl_kunjungan', 'asc')
            ->get();
            $formatted = $visits;
        }

        // Breakdown per Poli
        $poliBreakdown = Kunjungan::join('polis', 'kunjungans.poli_id', '=', 'polis.id')
            ->select('polis.nama_poli as label', DB::raw('count(*) as total'))
            ->groupBy('polis.nama_poli')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'tren_kunjungan' => $formatted,
                'breakdown_poli' => $poliBreakdown
            ]
        ]);
    }

    /**
     * Get top 10 diseases diagnosed.
     */
    public function laporanPenyakit()
    {
        $penyakit = RekamMedis::select('diagnosa as label', 'kode_icd10 as code', DB::raw('count(*) as total'))
            ->groupBy('diagnosa', 'kode_icd10')
            ->orderBy('total', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $penyakit
        ]);
    }

    /**
     * Get drug inventory status report.
     */
    public function laporanStokObat()
    {
        $obats = Obat::select('nama_obat', 'stok', 'satuan', 'kategori', 'tgl_kadaluarsa')
            ->orderBy('stok', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $obats
        ]);
    }

    /**
     * Get financial/payments summary report.
     */
    public function laporanKeuangan()
    {
        // Daily revenue for last 7 days
        $revenue = Pembayaran::select(
            DB::raw('DATE_FORMAT(updated_at, "%d/%m") as label'),
            DB::raw('SUM(total_bayar) as total')
        )
        ->where('status', 'lunas')
        ->where('updated_at', '>=', now()->subDays(7))
        ->groupBy(DB::raw('DATE_FORMAT(updated_at, "%d/%m")'))
        ->orderBy('updated_at', 'asc')
        ->get();

        // Method breakdown
        $methods = Pembayaran::select('metode_bayar as label', DB::raw('SUM(total_bayar) as total'))
            ->where('status', 'lunas')
            ->groupBy('metode_bayar')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'tren_pendapatan' => $revenue,
                'breakdown_metode' => $methods
            ]
        ]);
    }
}
