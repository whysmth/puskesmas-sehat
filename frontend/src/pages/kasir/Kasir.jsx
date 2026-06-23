import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { CreditCard, Search, DollarSign, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

const Kasir = () => {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Billing state
  const [paymentMethod, setPaymentMethod] = useState('tunai');
  const [amountPaid, setAmountPaid] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [formLoading, setFormLoading] = useState(false);

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      // Fetch today's completed visits
      const res = await api.get('/kunjungan', {
        params: { status: 'selesai', tanggal: new Date().toISOString().split('T')[0] }
      });
      if (res.data.status === 'success') {
        // Filter locally or fetch all
        setVisits(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  // Fetch full details of the visit for billing
  const openBillingModal = async (visitId) => {
    try {
      const res = await api.get(`/pembayaran/kunjungan/${visitId}`);
      if (res.data.status === 'success') {
        setSelectedVisit(res.data.data);
        setPaymentMethod('tunai');
        setAmountPaid('');
        setChangeAmount(0);
        setIsBillingModalOpen(true);
      }
    } catch (err) {
      alert('Gagal mengambil rincian tagihan.');
    }
  };

  // Cash change calculator
  useEffect(() => {
    if (!selectedVisit || !selectedVisit.pembayaran) return;
    const total = parseFloat(selectedVisit.pembayaran.total_bayar);
    const paid = parseFloat(amountPaid) || 0;
    setChangeAmount(paid >= total ? paid - total : 0);
  }, [amountPaid, selectedVisit]);

  const handleProcessPayment = async () => {
    if (!selectedVisit) return;
    const total = parseFloat(selectedVisit.pembayaran.total_bayar);
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'tunai' && paid < total) {
      alert('Jumlah uang yang dibayarkan kurang!');
      return;
    }

    setFormLoading(true);
    try {
      const res = await api.post('/pembayaran/bayar', {
        kunjungan_id: selectedVisit.id,
        metode_bayar: paymentMethod
      });

      if (res.data.status === 'success') {
        setIsBillingModalOpen(false);
        fetchVisits();
        
        // Fetch updated receipt layout
        const resReceipt = await api.get(`/pembayaran/kunjungan/${selectedVisit.id}`);
        setSelectedVisit(resReceipt.data.data);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      alert('Gagal memproses pembayaran.');
    } finally {
      setFormLoading(false);
    }
  };

  const openReceiptModal = async (visitId) => {
    try {
      const res = await api.get(`/pembayaran/kunjungan/${visitId}`);
      if (res.data.status === 'success') {
        setSelectedVisit(res.data.data);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      alert('Gagal memuat kwitansi.');
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredVisits = visits.filter(v =>
    v.pasien.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.pasien.no_rm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Search bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pasien checkout (Nama / RM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium hover:border-slate-300"
          />
        </div>
        <Button variant="outline" onClick={fetchVisits} className="w-full sm:w-auto">
          Segarkan Kasir
        </Button>
      </div>

      {/* Visits Checkout Table */}
      <Table
        headers={['Nama Pasien', 'Poli Pemeriksaan', 'Tipe Pasien', 'Total Tagihan', 'Status Pembayaran', 'Aksi']}
        data={filteredVisits}
        isLoading={isLoading}
        emptyMessage="Hari ini belum ada pasien checkout medis di kasir."
        renderRow={(visit) => (
          <tr key={visit.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 text-sm font-bold text-slate-800">
              {visit.pasien.nama}
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{visit.pasien.no_rm}</span>
            </td>
            <td className="px-6 py-4 text-xs font-bold text-slate-600">{visit.poli.nama_poli}</td>
            <td className="px-6 py-4 text-xs">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                visit.pasien.jenis_pasien === 'bpjs' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200'
              }`}>
                {visit.pasien.jenis_pasien}
              </span>
            </td>
            <td className="px-6 py-4 text-sm font-black text-slate-800">
              {visit.pembayaran ? formatRupiah(visit.pembayaran.total_bayar) : 'Rp 0'}
            </td>
            <td className="px-6 py-4 text-xs">
              <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                visit.pembayaran?.status === 'lunas'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {visit.pembayaran?.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
              </span>
            </td>
            <td className="px-6 py-4 text-xs font-semibold flex items-center gap-2">
              {visit.pembayaran?.status === 'belum_bayar' ? (
                <Button variant="primary" size="sm" onClick={() => openBillingModal(visit.id)} className="flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5" />
                  Bayar Tagihan
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => openReceiptModal(visit.id)} className="flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Kwitansi
                </Button>
              )}
            </td>
          </tr>
        )}
      />

      {/* Modal: Process Billing Payments */}
      <Modal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title="Proses Tagihan & Rincian Pembayaran"
        actionLabel="Konfirmasi Pembayaran"
        onAction={handleProcessPayment}
        isActionLoading={formLoading}
        size="lg"
      >
        {selectedVisit && selectedVisit.pembayaran && (
          <div className="space-y-6 text-xs">
            {/* Patient overview card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pasien</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedVisit.pasien.nama}</p>
                <p className="text-slate-500 mt-0.5">RM: {selectedVisit.pasien.no_rm}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Poli Pemeriksaan</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedVisit.poli.nama_poli}</p>
                <p className="text-emerald-600 font-bold uppercase mt-1">Jenis: {selectedVisit.pasien.jenis_pasien}</p>
              </div>
            </div>

            {/* Itemized Billing details */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase border-b border-slate-100 pb-2">Rincian Item Tagihan</h4>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Item Layanan / Tindakan / Obat</th>
                      <th className="px-4 py-2 text-right">Harga</th>
                      <th className="px-4 py-2 text-center">Jumlah</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    {/* 1. Tindakan / Consultations */}
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-800">Tindakan Medis & Pemeriksaan Dokter</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(selectedVisit.pembayaran.total_tindakan)}</td>
                      <td className="px-4 py-3 text-center">1</td>
                      <td className="px-4 py-3 text-right">{formatRupiah(selectedVisit.pembayaran.total_tindakan)}</td>
                    </tr>
                    
                    {/* 2. Medicine items */}
                    {selectedVisit.rekam_medis?.resep?.details.map((d, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 pl-8 text-slate-500">{d.obat.nama_obat} ({d.dosis})</td>
                        <td className="px-4 py-3 text-right">{formatRupiah(d.obat.harga)}</td>
                        <td className="px-4 py-3 text-center">{d.jumlah}</td>
                        <td className="px-4 py-3 text-right">{formatRupiah(d.obat.harga * d.jumlah)}</td>
                      </tr>
                    ))}

                    {/* Total Summary Row */}
                    <tr className="bg-slate-50 font-black text-slate-800 text-sm">
                      <td colSpan="3" className="px-4 py-3 text-right">Total Tagihan:</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{formatRupiah(selectedVisit.pembayaran.total_bayar)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment calculator & Method form */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Metode Pembayaran"
                name="metode_bayar"
                type="select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'tunai', label: 'Tunai (Cash)' },
                  { value: 'debit', label: 'Debit / Kartu Kredit' },
                  { value: 'bpjs', label: 'BPJS Kesehatan' }
                ]}
                required
              />

              {paymentMethod === 'tunai' ? (
                <div className="space-y-4">
                  <Input
                    label="Uang Dibayar (Cash)"
                    name="amount_paid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Masukkan jumlah uang cash..."
                    required
                  />
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-500">Kembalian:</span>
                    <span className="text-sm font-black text-emerald-600">{formatRupiah(changeAmount)}</span>
                  </div>
                </div>
              ) : paymentMethod === 'bpjs' ? (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-emerald-800">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="font-semibold">Pasien BPJS: Biaya tagihan ditanggung sepenuhnya oleh sistem BPJS Kesehatan Puskesmas.</p>
                </div>
              ) : (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-2.5 text-blue-800">
                  <CreditCard className="h-5 w-5 text-blue-500 shrink-0" />
                  <p className="font-semibold">Harap gesek kartu debit pasien pada mesin EDC bank terdaftar sebelum menyimpan transaksi.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* Modal: Printable Kwitansi (Receipt Invoice) */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Kwitansi Pembayaran Resmi"
        actionLabel="Cetak Kwitansi"
        onAction={() => window.print()}
        actionVariant="outline"
      >
        {selectedVisit && selectedVisit.pembayaran && (
          <div className="flex flex-col p-6 border border-slate-200 rounded-2xl bg-white space-y-6 max-w-md mx-auto shadow-sm text-xs">
            <div className="text-center">
              <h4 className="font-black text-slate-800 text-sm tracking-wide uppercase">UPT PUSKESMAS SEHAT KASIR</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Bukti Kwitansi Pembayaran Sah Pelayanan Medis</p>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-slate-600">
              <div>
                <p>No. RM: {selectedVisit.pasien.no_rm}</p>
                <p className="mt-1">Pasien: {selectedVisit.pasien.nama}</p>
                <p className="mt-1">Klinik: {selectedVisit.poli.nama_poli}</p>
              </div>
              <div className="text-right">
                <p>Kwitansi: #PAY-{selectedVisit.pembayaran.id}</p>
                <p className="mt-1">Tgl Bayar: {new Date(selectedVisit.pembayaran.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                <p className="mt-1">Metode: <span className="font-bold uppercase text-slate-700">{selectedVisit.pembayaran.metode_bayar}</span></p>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* List items */}
            <div className="space-y-1.5 font-medium text-slate-600 text-[10px]">
              <div className="flex justify-between">
                <span>Pemeriksaan Poli & Tindakan</span>
                <span className="font-bold">{formatRupiah(selectedVisit.pembayaran.total_tindakan)}</span>
              </div>
              {selectedVisit.rekam_medis?.resep?.details.map((d, i) => (
                <div key={i} className="flex justify-between pl-4 text-slate-500">
                  <span>{d.obat.nama_obat} (x{d.jumlah})</span>
                  <span>{formatRupiah(d.obat.harga * d.jumlah)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="flex justify-between items-center text-sm font-black text-slate-800">
              <span>Total Lunas:</span>
              <span className="text-emerald-600">{formatRupiah(selectedVisit.pembayaran.total_bayar)}</span>
            </div>

            <div className="border-t border-slate-200"></div>

            <div className="text-center text-[9px] text-slate-400 font-semibold space-y-1">
              <p>Kasir: {selectedVisit.pembayaran.kasir?.nama || 'BPJS System'}</p>
              <p>Terima kasih atas kunjungan Anda. Semoga lekas sembuh.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Kasir;
