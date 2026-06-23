import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Pill, ClipboardList, Plus, AlertTriangle, CheckSquare, Settings2, Trash2 } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Farmasi = () => {
  const [activeTab, setActiveTab] = useState('resep'); // resep or inventaris

  // Prescriptions state
  const [reseps, setReseps] = useState([]);
  const [isLoadingResep, setIsLoadingResep] = useState(false);

  // Inventory state
  const [obats, setObats] = useState([]);
  const [isLoadingObat, setIsLoadingObat] = useState(false);
  const [searchObat, setSearchObat] = useState('');

  // Modal & form states
  const [isObatModalOpen, setIsObatModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedObat, setSelectedObat] = useState(null);
  
  const [obatForm, setObatForm] = useState({
    nama_obat: '',
    satuan: 'tablet',
    stok: 100,
    harga: 5000,
    tgl_kadaluarsa: '',
    kategori: 'Generik'
  });

  const [stockValue, setStockValue] = useState(0);

  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Fetch prescriptions
  const fetchReseps = async () => {
    setIsLoadingResep(true);
    try {
      const res = await api.get('/resep');
      if (res.data.status === 'success') {
        setReseps(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingResep(false);
    }
  };

  // Fetch medicines
  const fetchObats = async () => {
    setIsLoadingObat(true);
    try {
      const res = await api.get('/obat', { params: { search: searchObat } });
      if (res.data.status === 'success') {
        setObats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingObat(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resep') {
      fetchReseps();
    } else {
      fetchObats();
    }
  }, [activeTab, searchObat]);

  // Dispense drug handler
  const handleDispense = async (resepId) => {
    if (!confirm('Apakah Anda yakin ingin memproses dan menyerahkan resep obat ini?')) return;
    try {
      const res = await api.put(`/resep/${resepId}/serahkan`);
      if (res.data.status === 'success') {
        alert('Resep berhasil diproses & obat diserahkan!');
        fetchReseps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses resep.');
    }
  };

  // Medicine Inventory handlers
  const handleOpenAddObat = () => {
    setSelectedObat(null);
    setObatForm({
      nama_obat: '',
      satuan: 'tablet',
      stok: 100,
      harga: 5000,
      tgl_kadaluarsa: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
      kategori: 'Generik'
    });
    setFormErrors({});
    setIsObatModalOpen(true);
  };

  const handleOpenEditObat = (obat) => {
    setSelectedObat(obat);
    setObatForm({
      nama_obat: obat.nama_obat,
      satuan: obat.satuan,
      stok: obat.stok,
      harga: parseFloat(obat.harga),
      tgl_kadaluarsa: obat.tgl_kadaluarsa,
      kategori: obat.kategori
    });
    setFormErrors({});
    setIsObatModalOpen(true);
  };

  const handleOpenStockObat = (obat) => {
    setSelectedObat(obat);
    setStockValue(obat.stok);
    setIsStockModalOpen(true);
  };

  const handleSaveObat = async () => {
    setFormLoading(true);
    setFormErrors({});
    try {
      let res;
      if (selectedObat) {
        res = await api.put(`/obat/${selectedObat.id}`, obatForm);
      } else {
        res = await api.post('/obat', obatForm);
      }
      if (res.data.status === 'success') {
        setIsObatModalOpen(false);
        fetchObats();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal menyimpan obat.');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveStock = async () => {
    setFormLoading(true);
    try {
      const res = await api.put(`/obat/${selectedObat.id}/stok`, { stok: stockValue });
      if (res.data.status === 'success') {
        setIsStockModalOpen(false);
        fetchObats();
      }
    } catch (err) {
      alert('Gagal memperbarui stok.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteObat = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus obat ini dari inventaris?')) return;
    try {
      const res = await api.delete(`/obat/${id}`);
      if (res.data.status === 'success') {
        fetchObats();
      }
    } catch (err) {
      alert('Gagal menghapus obat.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sliding Tabs Layout */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:max-w-md border border-slate-200">
        <button
          onClick={() => setActiveTab('resep')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === 'resep' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5" />
          Resep Masuk (Antrian)
        </button>
        <button
          onClick={() => setActiveTab('inventaris')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
            activeTab === 'inventaris' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="h-4.5 w-4.5" />
          Persediaan / Inventaris Obat
        </button>
      </div>

      {/* Tab: Resep Masuk */}
      {activeTab === 'resep' && (
        <Table
          headers={['Tgl Resep', 'Pasien', 'Poli Asal', 'Dokter', 'Rincian Resep', 'Status', 'Aksi']}
          data={reseps}
          isLoading={isLoadingResep}
          emptyMessage="Tidak ada antrian resep obat saat ini."
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-800">
                {item.rekam_medis.kunjungan.pasien.nama}
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{item.rekam_medis.kunjungan.pasien.no_rm}</span>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-slate-600">{item.rekam_medis.kunjungan.poli.nama_poli}</td>
              <td className="px-6 py-4 text-xs font-semibold text-slate-600">{item.rekam_medis.dokter.nama}</td>
              <td className="px-6 py-4 text-xs max-w-xs">
                <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
                  {item.details.map((d, i) => (
                    <li key={i}>
                      {d.obat.nama_obat} ({d.jumlah} {d.obat.satuan}) <br />
                      <span className="text-[10px] text-slate-400 font-semibold">{d.dosis} | {d.aturan_pakai}</span>
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-6 py-4 text-xs">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                  item.status === 'selesai'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs font-semibold">
                {item.status === 'baru' && (
                  <Button variant="primary" size="sm" onClick={() => handleDispense(item.id)} className="flex items-center gap-1">
                    <CheckSquare className="h-3.5 w-3.5" />
                    Serahkan
                  </Button>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {/* Tab: Persediaan Inventaris */}
      {activeTab === 'inventaris' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Plus className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari obat..."
                value={searchObat}
                onChange={(e) => setSearchObat(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium hover:border-slate-300"
              />
            </div>
            <Button variant="primary" onClick={handleOpenAddObat} className="w-full sm:w-auto flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tambah Obat
            </Button>
          </div>

          <Table
            headers={['Nama Obat', 'Kategori', 'Stok', 'Harga Satuan', 'Tgl Kadaluarsa', 'Aksi']}
            data={obats}
            isLoading={isLoadingObat}
            emptyMessage="Tidak ada obat dalam persediaan."
            renderRow={(obat) => (
              <tr key={obat.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {obat.nama_obat}
                  {obat.stok < 20 && (
                    <span className="ml-2 inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Kritis
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-600">{obat.kategori}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {obat.stok} <span className="text-xs text-slate-400 font-semibold">{obat.satuan}</span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                  Rp {parseFloat(obat.harga).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                  {new Date(obat.tgl_kadaluarsa).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </td>
                <td className="px-6 py-4 text-sm font-semibold flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenStockObat(obat)}>
                    Stok
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEditObat(obat)}>
                    Edit
                  </Button>
                  <button
                    onClick={() => handleDeleteObat(obat.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            )}
          />
        </div>
      )}

      {/* Modal: Add/Edit Obat */}
      <Modal
        isOpen={isObatModalOpen}
        onClose={() => setIsObatModalOpen(false)}
        title={selectedObat ? 'Edit Data Obat' : 'Tambah Obat Baru'}
        actionLabel="Simpan Obat"
        onAction={handleSaveObat}
        isActionLoading={formLoading}
      >
        <div className="space-y-4">
          <Input
            label="Nama Obat"
            name="nama_obat"
            value={obatForm.nama_obat}
            onChange={(e) => setObatForm(p => ({ ...p, nama_obat: e.target.value }))}
            placeholder="Contoh: Paracetamol 500mg"
            error={formErrors.nama_obat?.[0]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kategori"
              name="kategori"
              type="select"
              value={obatForm.kategori}
              onChange={(e) => setObatForm(p => ({ ...p, kategori: e.target.value }))}
              options={[
                { value: 'Generik', label: 'Generik' },
                { value: 'Antibiotik', label: 'Antibiotik' },
                { value: 'Antihistamin', label: 'Antihistamin' },
                { value: 'Sirup', label: 'Sirup / Cairan' },
                { value: 'Vitamin', label: 'Vitamin & Tambahan' }
              ]}
              required
            />
            <Input
              label="Satuan"
              name="satuan"
              type="select"
              value={obatForm.satuan}
              onChange={(e) => setObatForm(p => ({ ...p, satuan: e.target.value }))}
              options={[
                { value: 'tablet', label: 'Tablet / Kapsul' },
                { value: 'botol', label: 'Botol / Flac' },
                { value: 'pcs', label: 'Pcs / Unit' },
                { value: 'tube', label: 'Tube Salep' }
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga Jual (Rp)"
              name="harga"
              type="number"
              value={obatForm.harga}
              onChange={(e) => setObatForm(p => ({ ...p, harga: parseFloat(e.target.value) }))}
              error={formErrors.harga?.[0]}
              required
            />
            <Input
              label="Stok Awal"
              name="stok"
              type="number"
              value={obatForm.stok}
              onChange={(e) => setObatForm(p => ({ ...p, stok: parseInt(e.target.value) }))}
              disabled={!!selectedObat} // Use separate stock adjustment modal for edit mode
              error={formErrors.stok?.[0]}
              required
            />
          </div>
          <Input
            label="Tanggal Kedaluwarsa"
            name="tgl_kadaluarsa"
            type="date"
            value={obatForm.tgl_kadaluarsa}
            onChange={(e) => setObatForm(p => ({ ...p, tgl_kadaluarsa: e.target.value }))}
            error={formErrors.tgl_kadaluarsa?.[0]}
            required
          />
        </div>
      </Modal>

      {/* Modal: Adjust/Replenish Stock */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title="Sesuaikan Stok Obat"
        actionLabel="Simpan Stok"
        onAction={handleSaveStock}
        isActionLoading={formLoading}
      >
        {selectedObat && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700">
              <p>Obat: {selectedObat.nama_obat}</p>
              <p className="mt-1">Kategori: {selectedObat.kategori} | Satuan: {selectedObat.satuan}</p>
            </div>
            <Input
              label="Jumlah Stok Baru"
              type="number"
              value={stockValue}
              onChange={(e) => setStockValue(parseInt(e.target.value))}
              required
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Farmasi;
