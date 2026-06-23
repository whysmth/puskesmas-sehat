import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, User, Info } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!username || !password) {
      setLocalError('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Login gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user, pass) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col lg:flex-row gap-8 max-w-4xl w-full items-stretch">
        
        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex-1 flex flex-col justify-center">
          {/* Header Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">SIMPUS</h1>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Sistem Manajemen Puskesmas</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800">Selamat Datang Kembali</h2>
            <p className="text-xs text-slate-500 mt-1">Silakan masuk menggunakan kredensial akun Anda.</p>
          </div>

          {localError && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full shrink-0"></span>
              {localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Masuk Sistem
            </Button>
          </form>
        </div>

        {/* Quick Seeder Login Info Panel */}
        <div className="bg-slate-900 text-slate-300 p-8 rounded-3xl border border-slate-800 shadow-xl lg:w-96 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Kredensial Pengujian</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
              Klik salah satu akun di bawah untuk mengisi form login secara otomatis demi kemudahan pengujian fitur (role-based):
            </p>

            <div className="space-y-2">
              {[
                { label: 'Admin (Master & User)', u: 'admin', p: 'admin123', bg: 'hover:bg-red-500/10 hover:border-red-500/30' },
                { label: 'Pendaftaran (Front Office)', u: 'pendaftaran', p: 'pendaftaran123', bg: 'hover:bg-cyan-500/10 hover:border-cyan-500/30' },
                { label: 'Dokter / Perawat (Poli)', u: 'dokter', p: 'dokter123', bg: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
                { label: 'Apoteker (Farmasi)', u: 'apoteker', p: 'apoteker123', bg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30' },
                { label: 'Laboran (Laboratorium)', u: 'laboran', p: 'laboran123', bg: 'hover:bg-purple-500/10 hover:border-purple-500/30' },
                { label: 'Kasir (Pembayaran)', u: 'kasir', p: 'kasir123', bg: 'hover:bg-amber-500/10 hover:border-amber-500/30' },
                { label: 'Kepala Puskesmas (Read-only)', u: 'kepala', p: 'kepala123', bg: 'hover:bg-slate-500/10 hover:border-slate-500/30' }
              ].map((acc) => (
                <button
                  key={acc.u}
                  onClick={() => handleQuickLogin(acc.u, acc.p)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs flex justify-between items-center transition-all ${acc.bg}`}
                >
                  <span className="font-semibold text-slate-300">{acc.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{acc.u}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center mt-6">
            &copy; 2026 SIMPUS. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
