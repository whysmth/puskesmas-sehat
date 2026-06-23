import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { FlaskConical, Search, CheckSquare, Printer, CheckCircle } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Laboratorium = () => {
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  
  const [resultText, setResultText] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/laboratorium', { params: { status: filterStatus } });
      if (res.data.status === 'success') {
        setLabs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [filterStatus]);

  const openResultModal = (lab) => {
    setSelectedLab(lab);
    setResultText('');
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async () => {
    if (!resultText) {
      alert('Hasil lab wajib diisi.');
      return;
    }
    setFormLoading(true);
    try {
      const res = await api.put(`/laboratorium/${selectedLab.id}/hasil`, { hasil: resultText });
      if (res.data.status === 'success') {
        setIsResultModalOpen(false);
        fetchLabs();
        alert('Hasil pemeriksaan lab berhasil disimpan!');
      }
    } catch (err) {
      alert('Gagal menyimpan hasil lab.');
    } finally {
      setFormLoading(false);
    }
  };

  const openPrintModal = (lab) => {
    setSelectedLab(lab);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full md:max-w-xs">
          <label className="text-xs font-semibold text-slate-700">Filter Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold hover:border-slate-300"
          >
            <option value="">Semua Permintaan</option>
            <option value="permintaan">Menunggu Hasil (Permintaan)</option>
            <option value="selesai">Selesai Diperiksa</option>
          </select>
        </div>
        <Button variant="outline" onClick={fetchLabs} className="w-full md:w-auto">
          Segarkan
        </Button>
      </div>

      {/* Lab Requests Table */}
      <Table
        headers={['Pasien', 'Poli Asal', 'Dokter Pengirim', 'Jenis Pemeriksaan', 'Status', 'Aksi']}
        data={labs}
        isLoading={isLoading}
        emptyMessage="Tidak ada permintaan pemeriksaan laboratorium."
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-slate-800">
              {item.rekam_medis.kunjungan.pasien.nama}
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{item.rekam_medis.kunjungan.pasien.no_rm}</span>
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.rekam_medis.kunjungan.poli.nama_poli}</td>
            <td className="px-6 py-4 text-xs font-semibold text-slate-600">{item.rekam_medis.dokter.nama}</td>
            <td className="px-6 py-4 text-xs font-bold text-indigo-700">{item.jenis_pemeriksaan}</td>
            <td className="px-6 py-4 text-xs">
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                item.status === 'selesai'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
              }`}>
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-semibold flex items-center gap-2">
              {item.status === 'permintaan' ? (
                <Button variant="primary" size="sm" onClick={() => openResultModal(item)} className="flex items-center gap-1">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Input Hasil
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => openPrintModal(item)} className="flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" />
                  Hasil
                </Button>
              )}
            </td>
          </tr>
        )}
      />

      {/* Modal: Input Results */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Input Hasil Pemeriksaan Laboratorium"
        actionLabel="Simpan Hasil"
        onAction={handleSaveResult}
        isActionLoading={formLoading}
      >
        {selectedLab && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 space-y-1">
              <p>Pasien: {selectedLab.rekam_medis.kunjungan.pasien.nama} ({selectedLab.rekam_medis.kunjungan.pasien.no_rm})</p>
              <p>Jenis Uji: <span className="text-indigo-600 font-bold">{selectedLab.jenis_pemeriksaan}</span></p>
            </div>
            <Input
              label="Hasil Laboratorium (Teks detail / nilai lab)"
              name="hasil"
              type="textarea"
              rows={4}
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              placeholder="Contoh: Hb 14.2 g/dL (Normal), Leukosit 8.500 /uL (Normal)..."
              required
            />
          </div>
        )}
      </Modal>

      {/* Modal: Printable Slip */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Hasil Pemeriksaan Laboratorium"
        actionLabel="Cetak"
        onAction={() => window.print()}
        actionVariant="outline"
      >
        {selectedLab && (
          <div className="flex flex-col p-6 border border-slate-200 rounded-2xl bg-white space-y-6 max-w-md mx-auto shadow-sm text-xs">
            <div className="text-center">
              <h4 className="font-black text-slate-800 text-sm tracking-wide uppercase">LABORATORIUM PUSKESMAS SEHAT</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Surat Hasil Pemeriksaan Patologi Klinik</p>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="grid grid-cols-2 gap-4 text-[10px] font-semibold text-slate-600">
              <div>
                <p>No. RM: {selectedLab.rekam_medis.kunjungan.pasien.no_rm}</p>
                <p className="mt-1">Nama: {selectedLab.rekam_medis.kunjungan.pasien.nama}</p>
                <p className="mt-1">Gender: {selectedLab.rekam_medis.kunjungan.pasien.jenis_kelamin}</p>
              </div>
              <div className="text-right">
                <p>Tgl Uji: {new Date(selectedLab.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                <p className="mt-1">Dokter: {selectedLab.rekam_medis.dokter.nama}</p>
                <p className="mt-1">Poli Asal: {selectedLab.rekam_medis.kunjungan.poli.nama_poli}</p>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">Pemeriksaan: {selectedLab.jenis_pemeriksaan}</p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-800 whitespace-pre-wrap">
                {selectedLab.hasil}
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="text-center text-[10px] text-slate-400 font-medium">
              Ditandatangani secara elektronik oleh Laboran SIMPUS.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Laboratorium;
