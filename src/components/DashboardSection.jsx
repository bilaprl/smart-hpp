import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
// IMPORT RECHARTS
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

export default function DashboardSection({ isLoggedIn, openModal, navigate }) {
  const [businessType, setBusinessType] = useState('produksi');

  const [realData, setRealData] = useState({
    metrics: { in: "0", hpp: "0", kotor: "0", bersih: "0" },
    products: [],
    warnings: [],
    chartData: [] 
  });

  const content = {
    produksi: { metrics: { hppLabel: "Total Biaya (HPP)" }, warning: { col: "Nama Bahan Baku" } },
    retail: { metrics: { hppLabel: "Total Harga Beli" }, warning: { col: "Nama Barang Grosir" } },
    jasa: { metrics: { hppLabel: "Biaya Operasional" }, warning: { col: "Nama Material/Jasa" } }
  };

  const active = content[businessType];

  const handleDownloadPDF = () => {
    if (realData.products.length === 0) return alert("Data kosong.");
    
    const doc = new jsPDF();
    
    doc.text(`Laporan SmartHPP - ${businessType}`, 14, 15);

    autoTable(doc, {
      head: [['Nama Produk', 'Terjual', 'Pemasukan', 'Laba']],
      body: realData.products.map(p => [p.name, p.qty, p.rev, p.profit]),
      startY: 25,
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [212, 245, 66], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    doc.save(`Laporan_${businessType}_${new Date().toLocaleDateString('id-ID')}.pdf`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: trans } = await supabase
          .from('transactions')
          .select('*, products!inner(nama_produk, hpp_per_unit, kategori)')
          .eq('user_id', user.id)
          .eq('products.kategori', businessType)
          .order('tanggal', { ascending: true });
        
        let totalIn = 0; let totalHpp = 0;
        const productStats = {};
        const dailyData = {};

        if (trans) {
          trans.forEach(t => {
            const income = Number(t.total_pendapatan);
            const hppSatuan = t.products?.hpp_per_unit || 0;
            const expense = hppSatuan * t.qty_terjual;
            
            totalIn += income;
            totalHpp += expense;

            // LOGIKA GRAFIK: Simpan Income dan Profit harian
            if (!dailyData[t.tanggal]) dailyData[t.tanggal] = { name: t.tanggal.split('-').slice(1,3).reverse().join('/'), income: 0, profit: 0 };
            dailyData[t.tanggal].income += income;
            dailyData[t.tanggal].profit += (income - expense);

            if (!productStats[t.products?.nama_produk]) {
              productStats[t.products?.nama_produk] = { qty: 0, rev: 0, hpp: 0 };
            }
            productStats[t.products?.nama_produk].qty += t.qty_terjual;
            productStats[t.products?.nama_produk].rev += income;
            productStats[t.products?.nama_produk].hpp += expense;
          });
        }

        const { data: ingredients } = await supabase
          .from('recipe_items')
          .select('*, products!inner(nama_produk, kategori)')
          .eq('user_id', user.id)
          .eq('products.kategori', businessType)
          .order('biaya_porsi', { ascending: false }).limit(3);

        setRealData({
          metrics: {
            in: totalIn.toLocaleString('id-ID'),
            hpp: totalHpp.toLocaleString('id-ID'),
            kotor: (totalIn - totalHpp).toLocaleString('id-ID'),
            bersih: (totalIn - totalHpp).toLocaleString('id-ID'),
          },
          products: Object.keys(productStats).map(name => ({
            name,
            qty: `${productStats[name].qty} Terjual`,
            rev: `Rp ${productStats[name].rev.toLocaleString('id-ID')}`,
            profit: `Rp ${(productStats[name].rev - productStats[name].hpp).toLocaleString('id-ID')}`
          })),
          warnings: (ingredients || []).map(ing => ({
            name: ing.nama_bahan,
            price: `Rp ${Number(ing.biaya_porsi).toLocaleString('id-ID')}`,
            link: ing.products?.nama_produk || "Produk N/A",
            status: "Beban Tinggi",
            color: "red"
          })),
          chartData: Object.values(dailyData) 
        });
      } catch (err) { console.error(err); }
    };
    if (isLoggedIn) fetchDashboardData();
  }, [isLoggedIn, businessType]);

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 mt-10 px-4">
        {/* Konten login tetap sama seperti kodemu sebelumnya */}
        <div className="bg-smart-card border border-smart-border p-8 md:p-16 rounded-[3rem] shadow-2xl transition-colors duration-300 overflow-hidden relative group">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-smart-lime/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20 shadow-lg">
                <span className="material-icons-round text-4xl">lock</span>
              </div>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl text-smart-text mb-6 leading-tight transition-colors">
                Pantau Performa Bisnis dalam <span className="text-smart-lime italic font-serif">Satu Genggaman.</span>
              </h2>
              <p className="text-smart-text-muted mb-10 text-lg leading-relaxed transition-colors max-w-lg">
                Masuk ke akun Anda untuk membuka fitur <b>Real-Time Insight</b>, grafik laba-rugi otomatis, dan evaluasi bahan baku yang paling menguras margin usaha Anda.
              </p>
              <button onClick={() => openModal('auth')} className="bg-smart-lime text-smart-dark font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 text-lg shadow-[0_10px_30px_rgba(212,245,66,0.3)] flex items-center gap-3 w-full sm:w-auto justify-center">
                Masuk Sekarang
              </button>
            </div>
            <div className="w-full lg:w-1/2 relative z-10">
                <div className="relative group/image">
                    <div className="absolute -inset-4 bg-smart-lime/10 blur-2xl rounded-[2rem] opacity-30 group-hover/image:opacity-60 transition-opacity"></div>
                    <div className="relative bg-smart-bg border-4 border-smart-border rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300">
                        <img src="/dashboard.png" alt="Preview" className="w-full h-auto object-cover opacity-100" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 flex flex-col gap-6">
      
      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-smart-card border border-smart-border p-5 rounded-[1.5rem] shadow-lg transition-colors duration-300">
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full bg-smart-bg border border-smart-border text-sm font-semibold rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-smart-lime text-smart-text appearance-none cursor-pointer transition-colors">
              <option value="produksi">Tipe Bisnis: Produksi (F&B)</option>
              <option value="retail">Retail - Beli Jual</option>
              <option value="jasa">Jasa / Pelayanan</option>
            </select>
            <span className="material-icons-round absolute right-3 top-3 text-smart-text-muted pointer-events-none text-lg">expand_more</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <select className="w-full bg-smart-bg border border-smart-border text-sm font-semibold rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-smart-lime text-smart-text appearance-none cursor-pointer transition-colors">
              <option>Mei 2026</option>
              <option>Bulan Lalu (April)</option>
            </select>
            <span className="material-icons-round absolute right-3 top-3 text-smart-text-muted pointer-events-none text-lg">calendar_today</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button onClick={() => openModal('transaction')} className="bg-gradient-to-r from-smart-lime to-[#b7d62b] text-smart-dark font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto hover:scale-105 transition-transform shadow-[0_4px_15px_rgba(212,245,66,0.2)]">
            <span className="material-icons-round text-lg">add</span> Update Penjualan
          </button>
          <button onClick={handleDownloadPDF} className="bg-smart-bg border border-smart-border text-sm font-semibold text-smart-text px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-smart-border transition-colors w-full sm:w-auto">
            <span className="material-icons-round text-lg">picture_as_pdf</span> Unduh PDF
          </button>
        </div>
      </div>

      {/* SECTION 1: METRICS (Tetap sama) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 z-10"><span className="material-icons-round text-blue-500">account_balance_wallet</span></div>
          </div>
          <p className="text-smart-text-muted text-sm font-semibold mb-1 relative z-10">Total Pemasukan</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text relative z-10">Rp {realData.metrics.in}</h3>
        </div>

        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 z-10"><span className="material-icons-round text-red-500">shopping_cart</span></div>
          </div>
          <p className="text-smart-text-muted text-sm font-semibold mb-1 relative z-10">{active.metrics.hppLabel}</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text relative z-10">Rp {realData.metrics.hpp}</h3>
        </div>

        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 z-10"><span className="material-icons-round text-purple-500">payments</span></div>
          </div>
          <p className="text-smart-text-muted text-sm font-semibold mb-1 relative z-10">Laba Kotor</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text relative z-10">Rp {realData.metrics.kotor}</h3>
        </div>

        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-smart-lime/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-smart-lime/10 rounded-2xl flex items-center justify-center border border-smart-lime/20 z-10"><span className="material-icons-round text-smart-lime">monetization_on</span></div>
          </div>
          <p className="text-smart-text-muted text-sm font-semibold mb-1 relative z-10">Laba Bersih Keseluruhan</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-lime drop-shadow-md relative z-10">Rp {realData.metrics.bersih}</h3>
        </div>
      </div>

      {/* SECTION 2: CHART & PRODUCTS (DIUBAH KE REAL CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-montserrat font-bold text-lg text-smart-text">Visualisasi Tren Riwayat</h3>
              <p className="text-smart-text-muted text-xs mt-1">Pemasukan vs Laba Bersih</p>
            </div>
          </div>
          <div className="flex-grow bg-smart-bg rounded-2xl border border-smart-border p-2 md:p-4 h-64 relative transition-colors">
            {realData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={realData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#d4f54244" strokeWidth={3} dot={false} name="Pemasukan" />
                    <Line type="monotone" dataKey="profit" stroke="#d4f542" strokeWidth={4} dot={{ r: 4, fill: '#d4f542' }} name="Laba Bersih" />
                  </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <span className="material-icons-round text-4xl text-smart-border mb-2">insights</span>
                    <p className="text-smart-text-muted text-sm italic">Belum ada data transaksi untuk grafik.</p>
                </div>
            )}
          </div>
        </div>

        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-lg text-smart-text mb-1">Kinerja Spesifik Produk</h3>
          <p className="text-smart-text-muted text-xs mb-6">Produk penopang laba tertinggi.</p>
          <div className="space-y-4 flex-grow">
            {realData.products.length > 0 ? realData.products.map((prod, i) => (
              <div key={i} className="bg-smart-bg border border-smart-border p-4 rounded-2xl flex flex-col gap-2 hover:border-smart-lime/50 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-smart-text text-sm">{prod.name}</h4>
                  <span className="text-xs bg-smart-border text-smart-text-muted px-2 py-1 rounded-md">{prod.qty}</span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <div><p className="text-[10px] text-smart-text-muted uppercase font-semibold">Pemasukan</p><p className="text-sm font-semibold text-smart-text">{prod.rev}</p></div>
                  <div className="text-right"><p className="text-[10px] text-smart-text-muted uppercase font-semibold">Laba Bersih</p><p className="text-sm font-bold text-smart-lime">{prod.profit}</p></div>
                </div>
              </div>
            )) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 py-10 border-2 border-dashed border-smart-border rounded-2xl">
                    <span className="material-icons-round text-5xl mb-2">inventory_2</span>
                    <p className="text-sm italic font-bold">Data Produk Kosong</p>
                </div>
            )}
          </div>
          <button onClick={() => navigate('hpp')} className="w-full mt-4 text-xs font-bold text-smart-text-muted hover:text-smart-text transition-colors">Lihat Semua Produk &rarr;</button>
        </div>
      </div>

      {/* SECTION 3: WARNING (Tetap sama) */}
      <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20"><span className="material-icons-round text-red-500 text-xl">warning_amber</span></div>
          <h3 className="font-montserrat font-bold text-lg text-smart-text">Perhatian: {active.warning.col} Membebani Biaya</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="text-smart-text-muted border-b border-smart-border/80 text-xs uppercase tracking-wider">
                <th className="pb-4 font-semibold w-[30%]">{active.warning.col}</th>
                <th className="pb-4 font-semibold w-[20%]">Total Biaya</th>
                <th className="pb-4 font-semibold w-[30%]">Terikat Pada Produk</th>
                <th className="pb-4 font-semibold w-[20%]">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-smart-border/50">
              {realData.warnings.length > 0 ? realData.warnings.map((w, i) => (
                <tr key={i} className="group hover:bg-smart-border/30 transition-colors">
                  <td className="py-4 text-smart-text font-bold">{w.name}</td>
                  <td className="py-4 font-semibold text-red-500">{w.price}</td>
                  <td className="py-4 text-smart-text-muted text-xs font-bold italic">{w.link}</td>
                  <td className="py-4"><span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">Beban Tinggi</span></td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="py-10 text-center text-smart-text-muted opacity-40 font-semibold italic">Tidak ada peringatan biaya.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}