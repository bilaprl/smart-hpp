import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function DashboardSection({ isLoggedIn, openModal, navigate }) {
  const [businessType, setBusinessType] = useState("produksi");
  
  // STATE REAL DATA: Inisialisasi dengan nilai 0 agar tidak langsung muncul angka dummy
  const [realData, setRealData] = useState({
    metrics: { in: 0, hpp: 0, kotor: 0, bersih: 0 },
    products: [],
    warnings: []
  });

  // DATA SOURCE DUMMY (Hanya tampil saat !isLoggedIn atau data benar-benar kosong)
  const content = {
    produksi: {
      metrics: { hppLabel: "Total Biaya (HPP)", in: "25.500.000", hpp: "12.800.000", kotor: "12.700.000", bersih: "8.100.000" },
      products: [
        { name: "Kopi Susu Aren", qty: "145 Terjual", rev: "Rp 3.625.000", profit: "Rp 1.812.500" },
        { name: "Roti Bakar Coklat", qty: "98 Terjual", rev: "Rp 2.450.000", profit: "Rp 1.100.000" },
        { name: "Matcha Latte", qty: "76 Terjual", rev: "Rp 2.280.000", profit: "Rp 950.000" },
      ],
      warning: {
        col: "Nama Bahan Baku",
        items: [
          { name: "Biji Kopi Arabica (Premium)", price: "Rp 8.000.000", link: "Semua Menu Kopi", status: "Beban Tertinggi (62%)", color: "red" },
          { name: "Susu UHT Full Cream", price: "Rp 3.000.000", link: "Kopi Susu, Latte", status: "Evaluasi Supplier", color: "yellow" },
        ],
      },
    },
    retail: { /* ... data retail dummy kamu ... */ },
    jasa: { /* ... data jasa dummy kamu ... */ },
  };

  const activeDummy = content[businessType];

  // FUNGSI UNDUH DATA (CSV Sederhana)
  const handleDownload = () => {
    if (realData.products.length === 0) return alert("Tidak ada data untuk diunduh.");
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nama Produk,Kuantitas,Pemasukan,Laba\n"
      + realData.products.map(p => `${p.name},${p.qty},${p.rev},${p.profit}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_SmartHPP_${businessType}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Ambil Transaksi & Hitung Metrik
        const { data: trans } = await supabase.from('transactions').select('*, products(nama_produk, hpp_per_unit)').eq('user_id', user.id);
        
        let totalIn = 0;
        let totalHpp = 0;
        const productStats = {};

        if (trans) {
          trans.forEach(t => {
            totalIn += Number(t.total_pendapatan);
            // Hitung estimasi HPP berdasarkan qty terjual * HPP produk saat dibuat
            const hppSatuan = t.products?.hpp_per_unit || 0;
            totalHpp += (hppSatuan * t.qty_terjual);

            // Kelompokkan untuk "Kinerja Produk"
            if (!productStats[t.products?.nama_produk]) {
              productStats[t.products?.nama_produk] = { qty: 0, rev: 0, hpp: 0 };
            }
            productStats[t.products?.nama_produk].qty += t.qty_terjual;
            productStats[t.products?.nama_produk].rev += Number(t.total_pendapatan);
            productStats[t.products?.nama_produk].hpp += (hppSatuan * t.qty_terjual);
          });
        }

        // 2. Ambil Peringatan Bahan Baku (Termahal)
        const { data: ingredients } = await supabase.from('recipe_items').select('*').eq('user_id', user.id).order('biaya_porsi', { ascending: false }).limit(3);

        // Format data untuk state
        const formattedProducts = Object.keys(productStats).map(name => ({
          name,
          qty: `${productStats[name].qty} Terjual`,
          rev: `Rp ${productStats[name].rev.toLocaleString('id-ID')}`,
          profit: `Rp ${(productStats[name].rev - productStats[name].hpp).toLocaleString('id-ID')}`
        }));

        const formattedWarnings = (ingredients || []).map(ing => ({
          name: ing.nama_bahan,
          price: `Rp ${Number(ing.biaya_porsi).toLocaleString('id-ID')}`,
          link: "Detail Produk",
          status: "Beban Tinggi",
          color: "red"
        }));

        setRealData({
          metrics: {
            in: totalIn.toLocaleString('id-ID'),
            hpp: totalHpp.toLocaleString('id-ID'),
            kotor: (totalIn - totalHpp).toLocaleString('id-ID'),
            bersih: (totalIn - totalHpp).toLocaleString('id-ID'), // Sementara sama dengan kotor sebelum alokasi
          },
          products: formattedProducts,
          warnings: formattedWarnings
        });

      } catch (err) {
        console.error("Dashboard Error:", err);
      }
    };

    if (isLoggedIn) fetchDashboardData();
  }, [isLoggedIn, businessType]);

  // Menentukan tampilan angka (Real vs Dummy)
  const getVal = (key) => (isLoggedIn && realData.metrics.in !== 0 ? realData.metrics[key] : activeDummy.metrics[key]);
  const getProducts = () => (isLoggedIn && realData.products.length > 0 ? realData.products : activeDummy.products);
  const getWarnings = () => (isLoggedIn && realData.warnings.length > 0 ? realData.warnings : activeDummy.warning.items);

  if (!isLoggedIn) {
    /* ... KODE RETURN SAAT BELUM LOGIN (Sama seperti sebelumnya) ... */
    return (
      <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 mt-10 px-4">
        {/* Konten Login Kamu */}
        <div className="bg-smart-card border border-smart-border p-8 md:p-16 rounded-[3rem] shadow-2xl transition-colors duration-300 overflow-hidden relative group">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-smart-lime/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20 shadow-lg">
                <span className="material-icons-round text-4xl">lock</span>
              </div>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl text-smart-text mb-6 leading-tight transition-colors">
                Pantau Performa Bisnis dalam{" "}
                <span className="text-smart-lime italic font-serif">Satu Genggaman.</span>
              </h2>
              <p className="text-smart-text-muted mb-10 text-lg leading-relaxed transition-colors max-w-lg">
                Masuk ke akun Anda untuk membuka fitur <b>Real-Time Insight</b>, grafik laba-rugi otomatis, dan evaluasi bahan baku yang paling menguras margin usaha Anda.
              </p>
              <button onClick={() => openModal("auth")} className="bg-smart-lime text-smart-dark font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 text-lg shadow-[0_10px_30px_rgba(212,245,66,0.3)] flex items-center gap-3 w-full sm:w-auto justify-center">
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
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full bg-smart-bg border border-smart-border text-sm font-semibold rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-smart-lime text-smart-text appearance-none cursor-pointer transition-colors"
            >
              <option value="produksi">Tipe Bisnis: Produksi (F&B)</option>
              <option value="retail">Retail - Beli Jual</option>
              <option value="jasa">Jasa / Pelayanan</option>
            </select>
            <span className="material-icons-round absolute right-3 top-3 text-smart-text-muted pointer-events-none text-lg">expand_more</span>
          </div>
          {/* ... Dropdown Kalender tetap ... */}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button onClick={() => openModal("transaction")} className="bg-gradient-to-r from-smart-lime to-[#b7d62b] text-smart-dark font-bold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full sm:w-auto hover:scale-105 transition-transform shadow-[0_4px_15px_rgba(212,245,66,0.2)]">
            <span className="material-icons-round text-lg">add</span> Update Penjualan
          </button>
          <button onClick={handleDownload} className="bg-smart-bg border border-smart-border text-sm font-semibold text-smart-text px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-smart-border transition-colors w-full sm:w-auto">
            <span className="material-icons-round text-lg">download</span> Unduh Data
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors hover:border-smart-text-muted">
          <p className="text-smart-text-muted text-sm font-semibold mb-1">Total Pemasukan</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text">Rp {getVal('in')}</h3>
        </div>
        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors hover:border-smart-text-muted">
          <p className="text-smart-text-muted text-sm font-semibold mb-1">{activeDummy.metrics.hppLabel}</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text">Rp {getVal('hpp')}</h3>
        </div>
        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors hover:border-smart-text-muted">
          <p className="text-smart-text-muted text-sm font-semibold mb-1">Laba Kotor</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-text">Rp {getVal('kotor')}</h3>
        </div>
        <div className="bg-smart-card border border-smart-border p-6 rounded-[2rem] shadow-xl relative overflow-hidden group transition-colors hover:border-smart-lime">
          <p className="text-smart-text-muted text-sm font-semibold mb-1">Laba Bersih Keseluruhan</p>
          <h3 className="font-montserrat font-bold text-2xl lg:text-3xl text-smart-lime">Rp {getVal('bersih')}</h3>
        </div>
      </div>

      {/* PRODUK TERBAIK & PERINGATAN (Menggunakan logic getProducts dan getWarnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col">
            <h3 className="font-montserrat font-bold text-lg text-smart-text mb-6">Visualisasi Tren</h3>
            <div className="flex-grow bg-smart-bg rounded-2xl border border-smart-border p-4 flex items-center justify-center h-64 text-smart-text-muted italic">
                {isLoggedIn && realData.products.length > 0 ? "Grafik Real-Time Aktif" : "Data simulasi grafik"}
            </div>
        </div>

        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col transition-colors">
          <h3 className="font-montserrat font-bold text-lg text-smart-text mb-1">Kinerja Spesifik Produk</h3>
          <div className="space-y-4 mt-6">
            {getProducts().map((prod, i) => (
              <div key={i} className="bg-smart-bg border border-smart-border p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-smart-text text-sm">{prod.name}</h4>
                  <span className="text-xs bg-smart-border text-smart-text-muted px-2 py-1 rounded-md">{prod.qty}</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-sm font-semibold text-smart-text">{prod.rev}</p>
                  <p className="text-sm font-bold text-smart-lime">{prod.profit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABEL PERINGATAN */}
      <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl overflow-hidden">
        <h3 className="font-montserrat font-bold text-lg text-smart-text mb-6">Peringatan Biaya Terikat</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <tbody className="divide-y divide-smart-border/50">
              {getWarnings().map((w, i) => (
                <tr key={i} className="group hover:bg-smart-border/30 transition-colors">
                  <td className="py-4 text-smart-text font-bold">{w.name}</td>
                  <td className="py-4 text-red-500 font-semibold">{w.price}</td>
                  <td className="py-4 text-smart-text-muted text-xs">{w.link}</td>
                  <td className="py-4"><span className={`bg-${w.color}-500/10 text-${w.color}-500 border border-${w.color}-500/20 px-3 py-1.5 rounded-lg text-xs font-bold`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}