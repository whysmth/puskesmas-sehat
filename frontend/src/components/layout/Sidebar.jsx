import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserPlus,
  Stethoscope,
  Pill,
  FlaskConical,
  CreditCard,
  BarChart3,
  Settings,
  Activity,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'pendaftaran', 'dokter', 'apoteker', 'laboran', 'kasir', 'kepala']
    },
    {
      title: 'Pendaftaran',
      path: '/pendaftaran',
      icon: UserPlus,
      roles: ['admin', 'pendaftaran']
    },
    {
      title: 'Pemeriksaan Poli',
      path: '/poli',
      icon: Stethoscope,
      roles: ['admin', 'dokter']
    },
    {
      title: 'Farmasi & Apotek',
      path: '/farmasi',
      icon: Pill,
      roles: ['admin', 'apoteker']
    },
    {
      title: 'Laboratorium',
      path: '/laboratorium',
      icon: FlaskConical,
      roles: ['admin', 'laboran', 'dokter']
    },
    {
      title: 'Kasir & Pembayaran',
      path: '/kasir',
      icon: CreditCard,
      roles: ['admin', 'kasir']
    },
    {
      title: 'Laporan & Statistik',
      path: '/laporan',
      icon: BarChart3,
      roles: ['admin', 'kepala']
    },
    {
      title: 'Master Data',
      path: '/master-data',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredMenu = menuItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-emerald-500 text-white p-2 rounded-lg">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">SIMPUS</h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Layanan Sehat</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* User Footer info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm uppercase">
            {user.nama.substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-200 truncate">{user.nama}</p>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-800/40 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 rounded-lg transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
