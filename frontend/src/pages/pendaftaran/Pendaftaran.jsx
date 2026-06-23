import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Plus, Search, UserPlus, FileText, Printer, CheckCircle } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Pendaftaran = () => {
  // Patients list state
  const [pasiens, setPasiens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Poli list state
  const [polis, setPolis] = useState([]);

  // Modal states
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Forms states
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState({
    nik: '',
    nama: '',
    tgl_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    no_hp: '',
    jenis_pasien: 'umum',
    no_bpjs: ''
  });
  
  const [visitForm, setVisitForm] = useState({
    pasien_id: '',
    poli_id: '',
    tgl_kunjungan: ''
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [visitResult, setVisitResult] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch patients
  const fetchPatients = async (pageNum = 1, search = '') => {
    setIsLoading(true);
    try {
      const res = await api.get('/pasien', {
        params: { page: pageNum, search }
      });
      if (res.data.status === 'success') {
        setPasiens(res.data.data.data);
        setPage(res.data.data.current_page);
        setLastPage(res.data.data.last_page);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch clinics (polis)
  const fetchPolis = async () => {
    try {
      const res = await api.get('/poli');
      if (res.data.status === 'success') {
        setPolis(res.data.data.map(p => ({ value: p.id, label: `${p.nama_poli} (${p.kode_poli})` })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients(1, searchQuery);
    fetchPolis();
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value,
      // Clear BPJS number if patient type is switched to umum
      ...(name === 'jenis_pasien' && value === 'umum' ? { no_bpjs: '' } : {})
    }));
  };

  const openAddPatientModal = () => {
    setEditingPatientId(null);
    setPatientForm({
      nik: '',
      nama: '',
      tgl_lahir: '',
      jenis_kelamin: 'L',
      alamat: '',
      no_hp: '',
      jenis_pasien: 'umum',
      no_bpjs: ''
    });
    setFormErrors({});
    setIsPatientModalOpen(true);
  };

  const openEditPatientModal = (patient) => {
    setEditingPatientId(patient.id);
    setPatientForm({
      nik: patient.nik,
      nama: patient.nama,
      tgl_lahir: patient.tgl_lahir,
      jenis_kelamin: patient.jenis_kelamin,
      alamat: patient.alamat,
      no_hp: patient.no_hp,
      jenis_pasien: patient.jenis_pasien,
      no_bpjs: patient.no_bpjs || ''
    });
    setFormErrors({});
    setIsPatientModalOpen(true);
  };

  const handleSavePatient = async () => {
    setFormLoading(true);
    setFormErrors({});
    try {
      let res;
      if (editingPatientId) {
        res = await api.put(`/pasien/${editingPatientId}`, patientForm);
      } else {
        res = await api.post('/pasien', patientForm);
      }

      if (res.data.status === 'success') {
        setSuccessMsg(editingPatientId ? 'Data pasien berhasil diperbarui!' : 'Pasien baru berhasil didaftarkan!');
        setIsPatientModalOpen(false);
        fetchPatients(page, searchQuery);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan data pasien.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const openVisitModal = (patient) => {
    setSelectedPatient(patient);
    setVisitForm({
      pasien_id: patient.id,
      poli_id: '',
      tgl_kunjungan: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsVisitModalOpen(true);
  };

  const handleRegisterVisit = async () => {
    setFormLoading(true);
    setFormErrors({});
    try {
      const res = await api.post('/kunjungan', visitForm);
      if (res.data.status === 'success') {
        setVisitResult(res.data.data);
        setIsVisitModalOpen(false);
        setIsTicketModalOpen(true);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal mendaftarkan kunjungan.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const headers = ['No. RM', 'NIK', 'Nama Pasien', 'L/P', 'No. HP', 'Jenis Pasien', 'Aksi'];

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pasien (Nama / NIK / RM)..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium hover:border-slate-300"
          />
        </div>
        <Button variant="primary" onClick={openAddPatientModal} className="w-full sm:w-auto flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Pasien Baru
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Patients Table */}
      <Table
        headers={headers}
        data={pasiens}
        isLoading={isLoading}
        emptyMessage="Pasien tidak ditemukan. Silakan daftarkan pasien baru."
        pagination={{
          currentPage: page,
          lastPage: lastPage,
          onPageChange: (p) => fetchPatients(p, searchQuery)
        }}
        renderRow={(p) => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.no_rm}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.nik}</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.nama}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-500">{p.jenis_kelamin}</td>
            <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.no_hp}</td>
            <td className="px-6 py-4 text-sm font-medium">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                p.jenis_pasien === 'bpjs' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200'
              }`}>
                {p.jenis_pasien}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-medium flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => openEditPatientModal(p)}>
                Edit
              </Button>
              <Button variant="primary" size="sm" onClick={() => openVisitModal(p)} className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Kunjungan
              </Button>
            </td>
          </tr>
        )}
      />

      {/* Modal: Add/Edit Patient */}
      <Modal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title={editingPatientId ? 'Edit Data Pasien' : 'Registrasi Pasien Baru'}
        actionLabel="Simpan Data"
        onAction={handleSavePatient}
        isActionLoading={formLoading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="NIK (No. KTP)"
            name="nik"
            value={patientForm.nik}
            onChange={handlePatientFormChange}
            placeholder="16 Digit NIK"
            error={formErrors.nik?.[0]}
            required
          />
          <Input
            label="Nama Lengkap"
            name="nama"
            value={patientForm.nama}
            onChange={handlePatientFormChange}
            placeholder="Nama sesuai KTP"
            error={formErrors.nama?.[0]}
            required
          />
          <Input
            label="Tanggal Lahir"
            name="tgl_lahir"
            type="date"
            value={patientForm.tgl_lahir}
            onChange={handlePatientFormChange}
            error={formErrors.tgl_lahir?.[0]}
            required
          />
          <Input
            label="Jenis Kelamin"
            name="jenis_kelamin"
            type="select"
            value={patientForm.jenis_kelamin}
            onChange={handlePatientFormChange}
            options={[
              { value: 'L', label: 'Laki-laki' },
              { value: 'P', label: 'Perempuan' }
            ]}
            required
          />
          <Input
            label="No. HP"
            name="no_hp"
            value={patientForm.no_hp}
            onChange={handlePatientFormChange}
            placeholder="081xxxxxxxx"
            error={formErrors.no_hp?.[0]}
            required
          />
          <Input
            label="Jenis Pasien"
            name="jenis_pasien"
            type="select"
            value={patientForm.jenis_pasien}
            onChange={handlePatientFormChange}
            options={[
              { value: 'umum', label: 'Umum' },
              { value: 'bpjs', label: 'BPJS Kesehatan' }
            ]}
            required
          />
          {patientForm.jenis_pasien === 'bpjs' && (
            <Input
              label="No. Kartu BPJS"
              name="no_bpjs"
              value={patientForm.no_bpjs}
              onChange={handlePatientFormChange}
              placeholder="Masukkan nomor kartu BPJS"
              error={formErrors.no_bpjs?.[0]}
              required
            />
          )}
          <Input
            label="Alamat Lengkap"
            name="alamat"
            type="textarea"
            value={patientForm.alamat}
            onChange={handlePatientFormChange}
            placeholder="Alamat domisili saat ini"
            error={formErrors.alamat?.[0]}
            className="md:col-span-2"
            required
          />
        </div>
      </Modal>

      {/* Modal: Register Visit */}
      <Modal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        title="Daftarkan Kunjungan & Antrian"
        actionLabel="Daftarkan"
        onAction={handleRegisterVisit}
        isActionLoading={formLoading}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Data Pasien</p>
              <p className="text-sm font-bold text-slate-800">{selectedPatient.nama}</p>
              <p className="text-xs text-slate-500">No. RM: {selectedPatient.no_rm} | Tipe: <span className="font-bold text-slate-700 uppercase">{selectedPatient.jenis_pasien}</span></p>
            </div>
            
            <Input
              label="Pilih Poli Tujuan"
              name="poli_id"
              type="select"
              placeholder="-- Pilih Klinik / Poli --"
              value={visitForm.poli_id}
              onChange={(e) => setVisitForm(prev => ({ ...prev, poli_id: e.target.value }))}
              options={polis}
              error={formErrors.poli_id?.[0]}
              required
            />
            
            <Input
              label="Tanggal Kunjungan"
              name="tgl_kunjungan"
              type="date"
              value={visitForm.tgl_kunjungan}
              onChange={(e) => setVisitForm(prev => ({ ...prev, tgl_kunjungan: e.target.value }))}
              error={formErrors.tgl_kunjungan?.[0]}
              required
            />
          </div>
        )}
      </Modal>

      {/* Modal: Visual Ticket Slip */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Nomor Antrian Dibuat"
        actionLabel="Tutup"
        onAction={() => setIsTicketModalOpen(false)}
      >
        {visitResult && (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-4 max-w-sm mx-auto shadow-sm">
            <h4 className="text-center font-black text-slate-500 text-xs tracking-widest uppercase">UPT PUSKESMAS SEHAT</h4>
            <div className="w-full border-t border-dashed border-slate-200"></div>
            
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold">{visitResult.poli.nama_poli}</p>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight my-4">A-{visitResult.no_antrian}</h2>
              <p className="text-[10px] text-slate-400 font-medium">Harap menunggu panggilan di ruang tunggu</p>
            </div>

            <div className="w-full border-t border-dashed border-slate-200"></div>

            <div className="w-full text-center space-y-1 text-slate-500 text-[10px] font-semibold">
              <p>Pasien: {visitResult.pasien.nama}</p>
              <p>RM: {visitResult.pasien.no_rm}</p>
              <p>Tgl: {new Date(visitResult.tgl_kunjungan).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => window.print()} className="w-full flex items-center justify-center gap-1">
              <Printer className="h-4 w-4" />
              Cetak Tiket
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Pendaftaran;
