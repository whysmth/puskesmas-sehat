import { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { BarChart3, Users, Stethoscope, Pill, ShieldAlert, CreditCard, Calendar, Printer } from 'lucide-react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('kunjungan');

  // Reports states
  const [kunjunganData, setKunjunganData] = useState(null);
  const [penyakitData, setPenyakitData] = useState([]);
  const [obatData, setObatData] = useState([]);
  const [keuanganData, setKeuanganData] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [periode, setPeriode] = useState('bulan'); // bulan/tahun

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'kunjungan') {
        const res = await api.get('/laporan/kunjungan', { params: { periode } });
        if (res.data.status === 'success') setKunjunganData(res.data.data);
      } else if (activeTab === 'penyakit') {
        const res = await api.get('/laporan/penyakit-terbanyak');
        if (res.data.status === 'success') setPenyakitData(res.data.data);
      } else if (activeTab === 'obat') {
        const res = await api.get('/laporan/stok-obat');
        if (res.data.status === 'success') setObatData(res.data.data);
      } else if (activeTab === 'keuangan') {
        const res = await api.get('/laporan/keuangan');
        if (res.data.status === 'success') setKeuanganData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab, periode]);

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Helper to find max value for chart scaling
  const getMaxVal = (arr, key) => {
    if (!arr || arr.length === 0) return 1;
    return Math.max(...arr.map(item => parseFloat(item[key]) || 1));
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'kunjungan', label: 'Laporan Kunjungan', icon: Users },
            { id: 'penyakit', label: '10 Penyakit Terbanyak', icon: Stethoscope },
            { id: 'obat', label: 'Stok & Obat', icon: Pill },
            { id: 'keuangan', label: 'Keuangan & Kasir', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5 font-bold">
          <Printer className="h-4 w-4" />
          Cetak Laporan
        </Button>
      </div>

      {/* Render Reports Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[50vh]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs text-slate-500 font-semibold">Memuat rekapitulasi data...</span>
          </div>
        ) : (
          <>
            {/* 1. Laporan Kunjungan */}
            {activeTab === 'kunjungan' && kunjunganData && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Laporan & Tren Kunjungan Pasien</h3>
                    <p className="text-xs text-slate-400 font-medium">Statistik pendaftaran antrian pasien puskesmas</p>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-end">
                    <button
                      onClick={() => setPeriode('bulan')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${
                        periode === 'bulan' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Bulanan (10 Hari)
                    </button>
                    <button
                      onClick={() => setPeriode('tahun')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg ${
                        periode === 'tahun' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Tahunan (12 Bulan)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Visitis Trend Bar Chart */}
                  <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Grafik Kunjungan Pasien</h4>
                    <div className="h-64 flex items-end justify-between gap-2.5 pt-4">
                      {kunjunganData.tren_kunjungan?.map((item, i) => {
                        const maxVal = getMaxVal(kunjunganData.tren_kunjungan, 'total');
                        const pct = ((item.total || 0) / maxVal) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="relative w-full flex justify-center">
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-black transition-all">
                                {item.total}
                              </span>
                            </div>
                            <div
                              style={{ height: `${Math.max(pct, 5)}%` }}
                              className="w-full bg-emerald-500 group-hover:bg-emerald-600 rounded-lg shadow-sm transition-all"
                            ></div>
                            <span className="text-[9px] font-bold text-slate-500 font-mono rotate-45 mt-2">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Clinic Breakdown Table/Pie equivalent */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Proporsi Layanan Poli</h4>
                    <div className="space-y-4 pt-2">
                      {kunjunganData.breakdown_poli?.map((item, i) => (
                        <div key={i} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{item.label}</span>
                            <span>{item.total} Pasien</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${(item.total / (kunjunganData.breakdown_poli.reduce((a, b) => a + b.total, 0) || 1)) * 100}%` }}
                              className="bg-emerald-500 h-full rounded-full"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 10 Penyakit Terbanyak */}
            {activeTab === 'penyakit' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-800 text-lg">Laporan 10 Penyakit Terbanyak (Morbilitas)</h3>
                  <p className="text-xs text-slate-400 font-medium">Tren diagnosa ICD-10 terbanyak pasien puskesmas</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Diseases List Progress Bar */}
                  <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Grafik Top Penyakit</h4>
                    <div className="space-y-4 pt-2">
                      {penyakitData.map((item, i) => {
                        const maxVal = getMaxVal(penyakitData, 'total');
                        return (
                          <div key={i} className="space-y-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-700">
                              <span>{i + 1}. {item.label} {item.code ? `(${item.code})` : ''}</span>
                              <span>{item.total} Kasus</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${(item.total / maxVal) * 100}%` }}
                                className="bg-indigo-500 h-full rounded-full"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Table */}
                  <Table
                    headers={['Peringkat', 'Diagnosa Penyakit', 'Kode ICD-10', 'Jumlah Kasus']}
                    data={penyakitData}
                    emptyMessage="Data penyakit kosong."
                    renderRow={(item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-3.5 text-xs font-bold text-slate-500">#{idx + 1}</td>
                        <td className="px-6 py-3.5 text-sm font-bold text-slate-800">{item.label}</td>
                        <td className="px-6 py-3.5 text-xs font-bold text-indigo-600 font-mono">{item.code || '-'}</td>
                        <td className="px-6 py-3.5 text-sm font-black text-slate-700">{item.total}</td>
                      </tr>
                    )}
                  />
                </div>
              </div>
            )}

            {/* 3. Laporan Stok & Obat */}
            {activeTab === 'obat' && (
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-800 text-lg">Laporan Inventaris & Kadaluarsa Obat</h3>
                  <p className="text-xs text-slate-400 font-medium">Persediaan dan status kritis obat terdaftar</p>
                </div>

                <Table
                  headers={['Nama Obat', 'Kategori', 'Stok Tersedia', 'Satuan', 'Tgl Kadaluarsa', 'Status']}
                  data={obatData}
                  emptyMessage="Obat tidak tersedia."
                  renderRow={(item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 text-sm font-bold text-slate-800">{item.nama_obat}</td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-slate-600">{item.kategori}</td>
                      <td className="px-6 py-3.5 text-sm font-black text-slate-800">{item.stok}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-400 font-semibold">{item.satuan}</td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-slate-500">{new Date(item.tgl_kadaluarsa).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</td>
                      <td className="px-6 py-3.5 text-xs">
                        {item.stok < 20 ? (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold px-2 py-0.5 rounded-full">Kritis</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full">Aman</span>
                        )}
                      </td>
                    </tr>
                  )}
                />
              </div>
            )}

            {/* 4. Laporan Keuangan */}
            {activeTab === 'keuangan' && keuanganData && (
              <div className="space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-slate-800 text-lg">Laporan Keuangan & Kasir</h3>
                  <p className="text-xs text-slate-400 font-medium">Tren pendapatan pembayaran pasien puskesmas</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Financial Bar chart */}
                  <div className="lg:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Grafik Pendapatan Kasir</h4>
                    <div className="h-64 flex items-end justify-between gap-3 pt-4">
                      {keuanganData.tren_pendapatan?.map((item, i) => {
                        const maxVal = getMaxVal(keuanganData.tren_pendapatan, 'total');
                        const pct = ((item.total || 0) / maxVal) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="relative w-full flex justify-center">
                              <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded font-black transition-all whitespace-nowrap">
                                {formatRupiah(item.total)}
                              </span>
                            </div>
                            <div
                              style={{ height: `${Math.max(pct, 5)}%` }}
                              className="w-full bg-teal-500 group-hover:bg-teal-600 rounded-lg shadow-sm transition-all"
                            ></div>
                            <span className="text-[9px] font-bold text-slate-500 font-mono mt-2">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Method Breakdown progress list */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Breakdown Metode Pembayaran</h4>
                    <div className="space-y-4 pt-2">
                      {keuanganData.breakdown_metode?.map((item, i) => (
                        <div key={i} className="space-y-1.5 text-xs">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span className="uppercase">{item.label}</span>
                            <span>{formatRupiah(item.total)}</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${(item.total / (keuanganData.breakdown_metode.reduce((a, b) => a + parseFloat(b.total), 0) || 1)) * 100}%` }}
                              className="bg-teal-500 h-full rounded-full"
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Laporan;
