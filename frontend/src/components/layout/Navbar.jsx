import { useAuth } from '../../context/AuthContext';
import { Activity, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Format Page Title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard Utama';
    if (path.startsWith('/pendaftaran')) return 'Pendaftaran Pasien & Antrian';
    if (path.startsWith('/poli')) return 'Pemeriksaan Dokter & Rekam Medis';
    if (path.startsWith('/farmasi')) return 'Farmasi & Apotek Obat';
    if (path.startsWith('/laboratorium')) return 'Pelayanan Laboratorium';
    if (path.startsWith('/kasir')) return 'Billing & Kasir Pembayaran';
    if (path.startsWith('/laporan')) return 'Laporan & Statistik Kinerja';
    if (path.startsWith('/master-data')) return 'Pengaturan Master Data';
    return 'SIMPUS';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'dokter':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'apoteker':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'laboran':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'kasir':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pendaftaran':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-6">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Calendar className="h-4 w-4 text-slate-400" />
          {today}
        </div>

        {/* Separator */}
        <div className="hidden md:block h-4 w-px bg-slate-200"></div>

        {/* User Info & Role */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user.nama}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-1 ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
            {user.username.substring(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
