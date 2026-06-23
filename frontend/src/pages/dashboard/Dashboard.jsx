import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data.status === 'success') {
          setStats(res.data.data);
        }
      } catch (err) {
        setError('Gagal memuat statistik dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-semibold text-slate-500">Memuat data dashboard...</span>
        </div>
      </div>
    );
  }

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: 'Kunjungan Hari Ini',
      value: stats?.kunjungan_hari_ini || 0,
      desc: 'Pasien terdaftar hari ini',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600 border-blue-100',
    },
    {
      title: 'Kunjungan Bulan Ini',
      value: stats?.kunjungan_bulan_ini || 0,
      desc: 'Total kunjungan bulan berjalan',
      icon: Calendar,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Peringatan Stok Obat',
      value: stats?.obat_kritis || 0,
      desc: 'Item obat kritis (< 20 unit)',
      icon: AlertTriangle,
      color: stats?.obat_kritis > 0 ? 'bg-amber-500/10 text-amber-600 border-amber-100' : 'bg-slate-100 text-slate-500 border-slate-200',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatRupiah(stats?.pendapatan_hari_ini || 0),
      desc: 'Total transaksi kasir (Lunas)',
      icon: TrendingUp,
      color: 'bg-teal-500/10 text-teal-600 border-teal-100',
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Puskesmas Sehat Digital Center</h2>
          <p className="text-slate-400 text-sm max-w-xl">
            Semua fungsionalitas rekam medis, antrian klinik, persediaan apotek, lab, dan pembayaran kasir diintegrasikan secara penuh di sini.
          </p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shrink-0">
          <Activity className="h-4 w-4 animate-pulse text-emerald-400" />
          Koneksi API & Database Stabil
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 font-semibold">{card.title}</span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400 font-medium">{card.desc}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Queues and Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Antrian Aktif Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800">Antrian Poli Saat Ini</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pasien yang sedang menunggu panggilan dokter / pemeriksaan medis</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats?.antrian_aktif?.length || 0} Antrian
            </span>
          </div>

          {stats?.antrian_aktif?.length === 0 ? (
            <p className="text-center py-8 text-sm font-medium text-slate-400">Tidak ada antrian aktif saat ini.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats?.antrian_aktif?.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0">
                      #{item.no_antrian}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">{item.pasien.nama}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">{item.pasien.no_rm}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {item.poli.nama_poli}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                      item.status === 'diperiksa' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registered Patients */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800">Pendaftaran Terbaru</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Daftar registrasi kunjungan terakhir</p>
            </div>
          </div>

          <div className="space-y-4">
            {stats?.recent_visits?.length === 0 ? (
              <p className="text-center py-8 text-sm font-medium text-slate-400">Belum ada kunjungan.</p>
            ) : (
              stats?.recent_visits?.map((visit) => (
                <div key={visit.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">{visit.pasien.nama}</p>
                    <span className="text-[9px] text-slate-400 block">{visit.pasien.no_rm} | {visit.poli.nama_poli}</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                    visit.status === 'selesai'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {visit.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
