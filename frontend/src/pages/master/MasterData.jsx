import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Settings, UserPlus, Shield, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const MasterData = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal & Form states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    nama: '',
    username: '',
    password: '',
    role: 'pendaftaran'
  });

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.status === 'success') {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddUserModal = () => {
    setUserForm({
      nama: '',
      username: '',
      password: '',
      role: 'pendaftaran'
    });
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    setFormLoading(true);
    setFormErrors({});
    try {
      const res = await api.post('/users', userForm);
      if (res.data.status === 'success') {
        setIsUserModalOpen(false);
        fetchUsers();
        setSuccessMsg('Akun staf baru berhasil dibuat!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan user.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/users/${userId}/status`);
      if (res.data.status === 'success') {
        fetchUsers();
      }
    } catch (err) {
      alert('Gagal mengubah status pengguna.');
    }
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

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Manajemen User & Staf</h3>
          <p className="text-xs text-slate-400 font-medium">Kelola akun dan perizinan akses sistem SIMPUS</p>
        </div>
        <Button variant="primary" onClick={openAddUserModal} className="w-full sm:w-auto flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Registrasi Staf
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Users table */}
      <Table
        headers={['Nama Lengkap', 'Username', 'Hak Akses (Role)', 'Status Akun', 'Ubah Status']}
        data={users}
        isLoading={isLoading}
        emptyMessage="Tidak ada user terdaftar."
        renderRow={(u) => (
          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-slate-800">{u.nama}</td>
            <td className="px-6 py-4 text-sm font-semibold text-slate-600">{u.username}</td>
            <td className="px-6 py-4 text-xs font-semibold">
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border inline-block ${getRoleColor(u.role)}`}>
                {u.role}
              </span>
            </td>
            <td className="px-6 py-4 text-xs">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                u.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {u.status === 'active' ? 'Aktif' : 'Non-aktif'}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-semibold">
              <button
                onClick={() => handleToggleStatus(u.id)}
                className={`flex items-center gap-1 text-xs font-bold ${
                  u.status === 'active' ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                {u.status === 'active' ? (
                  <>
                    <ToggleRight className="h-5 w-5" />
                    Deaktifkan
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5" />
                    Aktifkan
                  </>
                )}
              </button>
            </td>
          </tr>
        )}
      />

      {/* Modal: Create User Account */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Registrasi Akun Staf Baru"
        actionLabel="Buat Akun"
        onAction={handleSaveUser}
        isActionLoading={formLoading}
      >
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="nama"
            value={userForm.nama}
            onChange={(e) => setUserForm(p => ({ ...p, nama: e.target.value }))}
            placeholder="Nama lengkap staf beserta gelar..."
            error={formErrors.nama?.[0]}
            required
          />
          <Input
            label="Username (Untuk Login)"
            name="username"
            value={userForm.username}
            onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))}
            placeholder="Username staf..."
            error={formErrors.username?.[0]}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={userForm.password}
            onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Min. 6 Karakter..."
            error={formErrors.password?.[0]}
            required
          />
          <Input
            label="Hak Akses (Role)"
            name="role"
            type="select"
            value={userForm.role}
            onChange={(e) => setUserForm(p => ({ ...p, role: e.target.value }))}
            options={[
              { value: 'admin', label: 'Admin (Master & Users)' },
              { value: 'pendaftaran', label: 'Pendaftaran (Front Office)' },
              { value: 'dokter', label: 'Dokter / Perawat (Poli)' },
              { value: 'apoteker', label: 'Apoteker (Apotek / Farmasi)' },
              { value: 'laboran', label: 'Laboran (Laboratorium)' },
              { value: 'kasir', label: 'Kasir (Kasir & Pembayaran)' },
              { value: 'kepala', label: 'Kepala Puskesmas (Read-only Laporan)' }
            ]}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default MasterData;
