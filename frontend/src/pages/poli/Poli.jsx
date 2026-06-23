import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Stethoscope, User, HelpCircle, History, Clock, Plus, Trash2, CheckSquare } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Poli = () => {
  // Clinic room selection
  const [selectedPoliId, setSelectedPoliId] = useState('');
  const [polis, setPolis] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  // Examination data sources
  const [medicines, setMedicines] = useState([]);
  const [tariffs, setTariffs] = useState([]);

  // Active examination state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Forms
  const [examForm, setExamForm] = useState({
    anamnesa: '',
    tensi: '',
    suhu: '',
    nadi: '',
    respirasi: '',
    berat_badan: '',
    tinggi_badan: '',
    diagnosa: '',
    kode_icd10: '',
    tindakan: '',
    tarif_ids: [], // Selected billing actions
    resep: [],     // Dynamic prescription items
    lab_pemeriksaan: [] // Lab orders
  });

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Fetch initial configs
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [resPolis, resObats, resTarif] = await Promise.all([
          api.get('/poli'),
          api.get('/obat'),
          api.get('/tarif-layanan')
        ]);
        if (resPolis.data.status === 'success') setPolis(resPolis.data.data);
        if (resObats.data.status === 'success') setMedicines(resObats.data.data);
        if (resTarif.data.status === 'success') setTariffs(resTarif.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInit();
  }, []);

  // Fetch queues when selected Poli changes
  const fetchQueue = async () => {
    if (!selectedPoliId) {
      setQueue([]);
      return;
    }
    setIsLoadingQueue(true);
    try {
      const res = await api.get('/kunjungan', {
        params: { poli_id: selectedPoliId, tanggal: new Date().toISOString().split('T')[0] }
      });
      if (res.data.status === 'success') {
        setQueue(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedPoliId]);

  // Queue actions
  const handleCallPatient = async (visitId) => {
    try {
      const res = await api.put(`/kunjungan/${visitId}/status`, { status: 'diperiksa' });
      if (res.data.status === 'success') {
        fetchQueue();
      }
    } catch (err) {
      alert('Gagal memanggil pasien.');
    }
  };

  const openExamModal = (visit) => {
    setSelectedVisit(visit);
    setExamForm({
      anamnesa: '',
      tensi: '120/80',
      suhu: '36.5',
      nadi: '80',
      respirasi: '20',
      berat_badan: '60',
      tinggi_badan: '165',
      diagnosa: '',
      kode_icd10: '',
      tindakan: '',
      tarif_ids: [],
      resep: [],
      lab_pemeriksaan: []
    });
    setFormErrors({});
    setIsExamModalOpen(true);
  };

  const openHistoryModal = async (patientId) => {
    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    try {
      const res = await api.get(`/rekam-medis/riwayat/${patientId}`);
      if (res.data.status === 'success') {
        setPatientHistory(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Prescription dynamic rows management
  const addPrescriptionItem = () => {
    setExamForm(prev => ({
      ...prev,
      resep: [...prev.resep, { obat_id: '', jumlah: 10, dosis: '3x1', aturan_pakai: 'Setelah makan' }]
    }));
  };

  const removePrescriptionItem = (index) => {
    setExamForm(prev => ({
      ...prev,
      resep: prev.resep.filter((_, idx) => idx !== index)
    }));
  };

  const updatePrescriptionItem = (index, field, value) => {
    setExamForm(prev => {
      const updated = [...prev.resep];
      updated[index][field] = value;
      return { ...prev, resep: updated };
    });
  };

  // Checkbox lists togglers
  const handleTariffToggle = (tariffId) => {
    setExamForm(prev => {
      const ids = prev.tarif_ids.includes(tariffId)
        ? prev.tarif_ids.filter(id => id !== tariffId)
        : [...prev.tarif_ids, tariffId];
      return { ...prev, tarif_ids: ids };
    });
  };

  const handleLabToggle = (labType) => {
    setExamForm(prev => {
      const types = prev.lab_pemeriksaan.includes(labType)
        ? prev.lab_pemeriksaan.filter(t => t !== labType)
        : [...prev.lab_pemeriksaan, labType];
      return { ...prev, lab_pemeriksaan: types };
    });
  };

  // Save RME Record
  const handleSaveExamination = async () => {
    setFormLoading(true);
    setFormErrors({});
    
    // Prepare payload structure
    const payload = {
      kunjungan_id: selectedVisit.id,
      anamnesa: examForm.anamnesa,
      ttv: {
        tensi: examForm.tensi,
        suhu: examForm.suhu,
        nadi: examForm.nadi,
        respirasi: examForm.respirasi,
        berat_badan: examForm.berat_badan,
        tinggi_badan: examForm.tinggi_badan
      },
      diagnosa: examForm.diagnosa,
      kode_icd10: examForm.kode_icd10,
      tindakan: examForm.tindakan,
      tarif_ids: examForm.tarif_ids,
      resep: examForm.resep,
      lab_pemeriksaan: examForm.lab_pemeriksaan
    };

    try {
      const res = await api.post('/rekam-medis', payload);
      if (res.data.status === 'success') {
        setIsExamModalOpen(false);
        fetchQueue();
        alert('Rekam medis pasien berhasil disimpan!');
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan rekam medis.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const headers = ['No. Antrian', 'No. RM', 'Nama Pasien', 'Tipe Pasien', 'Status', 'Aksi'];

  return (
    <div className="space-y-6">
      {/* Clinic Room Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full md:max-w-xs">
          <label className="text-xs font-semibold text-slate-700">Pilih Ruang Poli Klinik</label>
          <select
            value={selectedPoliId}
            onChange={(e) => setSelectedPoliId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold hover:border-slate-300"
          >
            <option value="">-- Pilih Klinik --</option>
            {polis.map(p => (
              <option key={p.id} value={p.id}>{p.nama_poli} ({p.kode_poli})</option>
            ))}
          </select>
        </div>
        {selectedPoliId && (
          <Button variant="outline" onClick={fetchQueue} className="w-full md:w-auto">
            Segarkan Antrian
          </Button>
        )}
      </div>

      {/* Queue Table */}
      {selectedPoliId ? (
        <Table
          headers={headers}
          data={queue}
          isLoading={isLoadingQueue}
          emptyMessage="Hari ini belum ada antrian di poli ini."
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-slate-800">#{item.no_antrian}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-700">{item.pasien.no_rm}</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.pasien.nama}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                  item.pasien.jenis_pasien === 'bpjs' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}>
                  {item.pasien.jenis_pasien}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                  item.status === 'selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.status === 'diperiksa'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold flex items-center gap-2">
                {item.status === 'menunggu' && (
                  <Button variant="primary" size="sm" onClick={() => handleCallPatient(item.id)}>
                    Panggil
                  </Button>
                )}
                {item.status === 'diperiksa' && (
                  <Button variant="success" size="sm" onClick={() => openExamModal(item)}>
                    Periksa
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => openHistoryModal(item.pasien_id)} className="flex items-center gap-1">
                  <History className="h-3.5 w-3.5" />
                  Riwayat
                </Button>
              </td>
            </tr>
          )}
        />
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-400">
          <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-sm font-semibold">Harap pilih ruang poli klinik di atas untuk menampilkan antrian pasien.</p>
        </div>
      )}

      {/* Modal: Patient Examination Form (RME) */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Formulir Pemeriksaan Medis Elektronik (RME)"
        actionLabel="Simpan Pemeriksaan & Selesai"
        onAction={handleSaveExamination}
        isActionLoading={formLoading}
        size="xl"
      >
        {selectedVisit && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedVisit.pasien.nama}</p>
                <p className="text-slate-500 mt-1">RM: {selectedVisit.pasien.no_rm} | Tgl Lahir: {new Date(selectedVisit.pasien.tgl_lahir).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
              </div>
              <span className="font-bold uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-100">
                {selectedVisit.pasien.jenis_pasien}
              </span>
            </div>

            {/* Main forms split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Physical Exam & Anamnesis */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b border-slate-100 pb-2">Pemeriksaan Fisik & Keluhan</h4>
                
                {/* Physical metrics (TTV) */}
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Tensi Darah" name="tensi" value={examForm.tensi} onChange={(e) => setExamForm(p => ({ ...p, tensi: e.target.value }))} placeholder="120/80" error={formErrors['ttv.tensi']?.[0]} required />
                  <Input label="Suhu Tubuh (°C)" name="suhu" value={examForm.suhu} onChange={(e) => setExamForm(p => ({ ...p, suhu: e.target.value }))} placeholder="36.5" error={formErrors['ttv.suhu']?.[0]} required />
                  <Input label="Nadi (bpm)" name="nadi" value={examForm.nadi} onChange={(e) => setExamForm(p => ({ ...p, nadi: e.target.value }))} placeholder="80" error={formErrors['ttv.nadi']?.[0]} required />
                  <Input label="Respirasi" name="respirasi" value={examForm.respirasi} onChange={(e) => setExamForm(p => ({ ...p, respirasi: e.target.value }))} placeholder="20" error={formErrors['ttv.respirasi']?.[0]} required />
                  <Input label="Berat Badan (kg)" name="berat_badan" value={examForm.berat_badan} onChange={(e) => setExamForm(p => ({ ...p, berat_badan: e.target.value }))} placeholder="60" error={formErrors['ttv.berat_badan']?.[0]} required />
                  <Input label="Tinggi Badan (cm)" name="tinggi_badan" value={examForm.tinggi_badan} onChange={(e) => setExamForm(p => ({ ...p, tinggi_badan: e.target.value }))} placeholder="165" error={formErrors['ttv.tinggi_badan']?.[0]} required />
                </div>

                <Input
                  label="Anamnesa (Keluhan & Riwayat Penyakit)"
                  name="anamnesa"
                  type="textarea"
                  value={examForm.anamnesa}
                  onChange={(e) => setExamForm(p => ({ ...p, anamnesa: e.target.value }))}
                  placeholder="Deskripsikan keluhan utama pasien..."
                  error={formErrors.anamnesa?.[0]}
                  required
                />
              </div>

              {/* Right Column: Diagnosis & ICD-10 */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b border-slate-100 pb-2">Diagnosa & Tindakan</h4>
                <Input
                  label="Diagnosa Utama"
                  name="diagnosa"
                  value={examForm.diagnosa}
                  onChange={(e) => setExamForm(p => ({ ...p, diagnosa: e.target.value }))}
                  placeholder="Diagnosa penyakit..."
                  error={formErrors.diagnosa?.[0]}
                  required
                />
                <Input
                  label="Kode ICD-10 (Opsional)"
                  name="kode_icd10"
                  value={examForm.kode_icd10}
                  onChange={(e) => setExamForm(p => ({ ...p, kode_icd10: e.target.value }))}
                  placeholder="Contoh: K29.7 (Gastritis)"
                  error={formErrors.kode_icd10?.[0]}
                />
                <Input
                  label="Deskripsi Tindakan Medis (Opsional)"
                  name="tindakan"
                  type="textarea"
                  value={examForm.tindakan}
                  onChange={(e) => setExamForm(p => ({ ...p, tindakan: e.target.value }))}
                  placeholder="Tindakan medis yang diberikan kepada pasien..."
                  error={formErrors.tindakan?.[0]}
                />
              </div>
            </div>

            {/* Actions Services Tariff Selection */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase border-b border-slate-100 pb-2">Biaya Tindakan Medis (Tarif Layanan)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tariffs.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      examForm.tarif_ids.includes(t.id)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={examForm.tarif_ids.includes(t.id)}
                      onChange={() => handleTariffToggle(t.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="truncate">{t.nama_layanan}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Rp {parseFloat(t.harga).toLocaleString('id-ID')}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Prescriptions Block */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-700 text-xs uppercase">Resep & Pemberian Obat</h4>
                <Button variant="outline" size="sm" onClick={addPrescriptionItem} className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Tambah Obat
                </Button>
              </div>

              {examForm.resep.length === 0 ? (
                <p className="text-center py-4 text-xs font-medium text-slate-400 border border-dashed border-slate-200 rounded-xl">Belum ada obat yang diresepkan.</p>
              ) : (
                <div className="space-y-3">
                  {examForm.resep.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-stretch md:items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Nama Obat</label>
                        <select
                          value={item.obat_id}
                          onChange={(e) => updatePrescriptionItem(idx, 'obat_id', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none"
                        >
                          <option value="">-- Pilih Obat --</option>
                          {medicines.map(m => (
                            <option key={m.id} value={m.id} disabled={m.stok <= 0}>
                              {m.nama_obat} ({m.kategori}) - Stok: {m.stok} {m.satuan} {m.stok <= 0 ? '(HABIS)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-20 shrink-0">
                        <Input
                          label="Jumlah"
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => updatePrescriptionItem(idx, 'jumlah', parseInt(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="w-full md:w-28 shrink-0">
                        <Input
                          label="Dosis"
                          value={item.dosis}
                          onChange={(e) => updatePrescriptionItem(idx, 'dosis', e.target.value)}
                          placeholder="3x1"
                        />
                      </div>
                      <div className="w-full md:w-44 shrink-0">
                        <Input
                          label="Aturan Pakai"
                          value={item.aturan_pakai}
                          onChange={(e) => updatePrescriptionItem(idx, 'aturan_pakai', e.target.value)}
                          placeholder="Setelah makan"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePrescriptionItem(idx)}
                        className="p-2.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 shrink-0 self-end md:mb-1.5"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Laboratory Tests Request Block */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase border-b border-slate-100 pb-2">Permintaan Pemeriksaan Laboratorium</h4>
              <div className="flex flex-wrap gap-4">
                {['Darah Lengkap', 'Urine Lengkap', 'Gula Darah', 'Asam Urat', 'Kolesterol'].map((labType) => (
                  <label
                    key={labType}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      examForm.lab_pemeriksaan.includes(labType)
                        ? 'bg-purple-50 border-purple-300 text-purple-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={examForm.lab_pemeriksaan.includes(labType)}
                      onChange={() => handleLabToggle(labType)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    {labType}
                  </label>
                ))}
              </div>
            </div>

          </div>
        )}
      </Modal>

      {/* Modal: Patient Timeline History */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Riwayat Rekam Medis Pasien"
        actionLabel="Tutup"
        onAction={() => setIsHistoryModalOpen(false)}
        size="lg"
      >
        {isLoadingHistory ? (
          <div className="text-center py-12">
            <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xs text-slate-500 font-semibold mt-2">Memuat riwayat...</p>
          </div>
        ) : patientHistory.length === 0 ? (
          <p className="text-center py-12 text-sm text-slate-400 font-medium">Belum ada riwayat pemeriksaan medis sebelumnya.</p>
        ) : (
          <div className="space-y-6">
            {patientHistory.map((history) => (
              <div key={history.id} className="relative border-l-2 border-emerald-500 pl-6 space-y-3">
                {/* Timeline circle */}
                <span className="absolute -left-1.5 top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{new Date(history.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border">{history.kunjungan.poli.nama_poli}</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                  <p><strong className="text-slate-700">Dokter:</strong> {history.dokter.nama}</p>
                  <p><strong className="text-slate-700">Anamnesa:</strong> {history.anamnesa}</p>
                  <p>
                    <strong className="text-slate-700">Fisik (TTV):</strong> Tensi: {history.ttv.tensi} | Temp: {history.ttv.suhu}°C | Nadi: {history.ttv.nadi} | Resp: {history.ttv.respirasi} | BB: {history.ttv.berat_badan}kg
                  </p>
                  <p><strong className="text-slate-700">Diagnosa:</strong> <span className="font-bold text-slate-800">{history.diagnosa}</span> {history.kode_icd10 ? `(${history.kode_icd10})` : ''}</p>
                  
                  {history.tindakan && (
                    <p><strong className="text-slate-700">Tindakan:</strong> {history.tindakan}</p>
                  )}

                  {history.resep && history.resep.details.length > 0 && (
                    <div>
                      <p><strong className="text-slate-700">Resep Obat:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 font-medium text-slate-600">
                        {history.resep.details.map((d, i) => (
                          <li key={i}>{d.obat.nama_obat} ({d.jumlah} {d.obat.satuan}) - {d.dosis} | {d.aturan_pakai}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {history.laboratoriums && history.laboratoriums.length > 0 && (
                    <div>
                      <p><strong className="text-slate-700">Hasil Lab:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 font-medium text-slate-600">
                        {history.laboratoriums.map((l, i) => (
                          <li key={i}>{l.jenis_pemeriksaan}: <span className="font-bold text-purple-700">{l.hasil || 'Menunggu hasil'}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Poli;
