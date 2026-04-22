import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

export default function KeuanganSection({ isLoggedIn, openModal }) {
  const baseLaba = 8100000;
  const [valModal, setValModal] = useState(50);
  const [valGaji, setValGaji] = useState(30);
  const [valDarurat, setValDarurat] = useState(20);

  const formatRp = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

  const total = Number(valModal) + Number(valGaji) + Number(valDarurat) || 1;
  const pModal = valModal / total;
  const pGaji = valGaji / total;
  const pDarurat = valDarurat / total;

  const [riwayat, setRiwayat] = useState([]);

  // Tarik data riwayat saat komponen dimuat
  useEffect(() => {
    const fetchRiwayat = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("allocations")
          .select("*")
          .eq("user_id", user.id)
          .order("periode_bulan", { ascending: false }); // Urutkan dari terbaru

        if (data) setRiwayat(data);
      }
    };
    if (isLoggedIn) fetchRiwayat();
  }, [isLoggedIn]);

  const handleSimpanAlokasi = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("allocations").insert([
      {
        user_id: user.id,
        periode_bulan: new Date().toISOString().split("T")[0], // Set bulan ini
        persen_modal: valModal,
        persen_gaji: valGaji,
        persen_tabungan: valDarurat,
      },
    ]);

    if (error) {
      alert("Gagal menyimpan alokasi: " + error.message);
    } else {
      alert("Persentase alokasi berhasil disimpan!");
      // Refresh halaman agar tabel bawah terupdate
      window.location.reload();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 mt-10 px-4">
        <div className="bg-smart-card border border-smart-border p-8 md:p-16 rounded-[3rem] shadow-2xl transition-colors duration-300 overflow-hidden relative group">
          {/* Dekorasi Cahaya Latar (Ungu/Purple karena tema Keuangan biasanya identik dengan tabungan) */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            {/* KOLOM KANAN (Teks & CTA) - Kita balik urutannya agar variasi dengan Dashboard */}
            <div className="w-full lg:w-1/2 text-left z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20 shadow-lg">
                <span className="material-icons-round text-4xl">lock</span>
              </div>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl text-smart-text mb-6 leading-tight transition-colors">
                Kelola Laba Bersih{" "}
                <span className="text-smart-lime italic font-serif">
                  Lebih Terstruktur.
                </span>
              </h2>
              <p className="text-smart-text-muted mb-10 text-lg leading-relaxed transition-colors max-w-lg">
                Bagi hasil jualan Anda ke pos{" "}
                <b>Modal, Gaji, dan Dana Darurat</b> secara otomatis. Jangan
                biarkan uang usaha dan pribadi tercampur lagi!
              </p>
              <button
                onClick={() => openModal("auth")}
                className="bg-smart-text text-smart-bg font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all duration-300 text-lg shadow-xl flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Mulai Alokasi Sekarang
              </button>
            </div>

            {/* KOLOM KIRI (PREVIEW SCREENSHOT TAJAM) */}
            <div className="w-full lg:w-1/2 relative z-10">
              <div className="relative group/image">
                {/* Aksen di belakang foto */}
                <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-[2rem] opacity-30 group-hover/image:opacity-60 transition-opacity"></div>

                {/* Frame Foto Screenshot Keuangan */}
                <div className="relative bg-smart-bg border-4 border-smart-border rounded-[2rem] shadow-2xl overflow-hidden transform lg:-rotate-2 group-hover/image:rotate-0 transition-transform duration-500">
                  <img
                    src="/Keuangan.png" // Ganti dengan path file screenshot halaman keuangan kamu
                    alt="Preview Manajer Alokasi SmartHPP"
                    className="w-full h-auto object-cover opacity-100"
                  />
                </div>

                {/* Badge Melayang untuk Pos Tabungan */}
                <div className="absolute -top-6 -right-6 bg-smart-card border border-smart-border p-4 rounded-2xl shadow-xl hidden md:flex items-center gap-3 animate-pulse transition-colors">
                  <div className="w-10 h-10 bg-purple-500/10 text-smart-lime rounded-full flex items-center justify-center">
                    <span className="material-icons-round text-xl">wallet</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-smart-text-muted font-bold uppercase tracking-tighter">
                      Dana Darurat
                    </p>
                    <p className="text-sm font-black text-smart-text">
                      Securely Saved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 flex flex-col gap-8">
      {/* =========================================
          HEADER: TOTAL LABA BERSIH
          ========================================= */}
      <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 rounded-full bg-smart-lime/10 flex items-center justify-center border border-smart-lime/20 hidden sm:flex">
            <span className="material-icons-round text-smart-lime text-3xl">
              account_balance_wallet
            </span>
          </div>
          <div>
            <h2 className="font-montserrat font-bold text-2xl text-smart-text mb-1">
              Manajer Alokasi Laba
            </h2>
            <p className="text-smart-text-muted text-sm">
              Ini total Laba Bersih operasional bulan ini yang siap
              dialokasikan.
            </p>
          </div>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-smart-bg p-5 rounded-2xl border border-smart-border shadow-inner transition-colors">
          <p className="text-smart-text-muted text-xs font-bold uppercase tracking-wider mb-1">
            Total Laba Bersih
          </p>
          <h1 className="font-montserrat font-extrabold text-3xl md:text-4xl text-smart-lime drop-shadow-md">
            {formatRp(baseLaba)}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* =========================================
            LEFT COLUMN: PENGATURAN SLIDER
            ========================================= */}
        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-xl mb-8 flex items-center gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted">
              tune
            </span>
            Atur Persentase Alokasi
          </h3>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="font-bold text-base text-smart-text">
                  Pos Modal
                </h4>
                <p className="text-xs text-smart-text-muted mt-0.5">
                  Alokasikan untuk perputaran Modal Usaha
                </p>
              </div>
              <span className="font-bold text-smart-lime text-xl bg-smart-bg px-3 py-1 rounded-lg border border-smart-border transition-colors">
                {(pModal * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={valModal}
              onChange={(e) => setValModal(e.target.value)}
              className="w-full"
            />
            <p className="text-right text-sm text-smart-text-muted opacity-80 mt-3 font-semibold">
              {formatRp(baseLaba * pModal)}
            </p>
          </div>

          <div className="mb-8 border-t border-smart-border/50 pt-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="font-bold text-base text-smart-text">
                  Pos Gaji Pemilik
                </h4>
                <p className="text-xs text-smart-text-muted mt-0.5">
                  Gaji Anda untuk kebutuhan pribadi
                </p>
              </div>
              <span className="font-bold text-blue-500 text-xl bg-smart-bg px-3 py-1 rounded-lg border border-smart-border transition-colors">
                {(pGaji * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={valGaji}
              onChange={(e) => setValGaji(e.target.value)}
              className="w-full"
            />
            <p className="text-right text-sm text-smart-text-muted opacity-80 mt-3 font-semibold">
              {formatRp(baseLaba * pGaji)}
            </p>
          </div>

          <div className="mb-4 border-t border-smart-border/50 pt-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="font-bold text-base text-smart-text">
                  Pos Dana Darurat / Tabungan
                </h4>
                <p className="text-xs text-smart-text-muted mt-0.5">
                  Alokasikan untuk tabungan masa depan
                </p>
              </div>
              <span className="font-bold text-purple-500 text-xl bg-smart-bg px-3 py-1 rounded-lg border border-smart-border transition-colors">
                {(pDarurat * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={valDarurat}
              onChange={(e) => setValDarurat(e.target.value)}
              className="w-full"
            />
            <p className="text-right text-sm text-smart-text-muted opacity-80 mt-3 font-semibold">
              {formatRp(baseLaba * pDarurat)}
            </p>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: VISUALISASI
            ========================================= */}
        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-xl mb-8 flex items-center gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted">
              donut_large
            </span>
            Visualisasi Alokasi
          </h3>

          <div className="flex-grow flex flex-col justify-start">
            {/* Progress Bar Stacked */}
            <div className="w-full h-12 rounded-full overflow-hidden flex bg-smart-bg mb-10 border border-smart-border shadow-inner relative transition-colors">
              <div
                className="bg-smart-lime h-full transition-all duration-300"
                style={{ width: `${pModal * 100}%` }}
              ></div>
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${pGaji * 100}%` }}
              ></div>
              <div
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${pDarurat * 100}%` }}
              ></div>
              {/* Garis batas halus */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmUgeDE9IjIwIiB5MT0iMCIgeDI9IjAiIHkyPSIyMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
            </div>

            {/* Legends */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-smart-bg rounded-2xl border border-smart-border group hover:border-smart-lime/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-md bg-smart-lime shadow-[0_0_10px_rgba(212,245,66,0.3)]"></div>
                  <div>
                    <span className="text-sm font-bold text-smart-text block">
                      Pos Modal
                    </span>
                    <span className="text-xs text-smart-text-muted">
                      {(pModal * 100).toFixed(0)}% dari Laba
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-smart-text">
                  {formatRp(baseLaba * pModal)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-smart-bg rounded-2xl border border-smart-border group hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-md bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                  <div>
                    <span className="text-sm font-bold text-smart-text block">
                      Pos Gaji
                    </span>
                    <span className="text-xs text-smart-text-muted">
                      {(pGaji * 100).toFixed(0)}% dari Laba
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-smart-text">
                  {formatRp(baseLaba * pGaji)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-smart-bg rounded-2xl border border-smart-border group hover:border-purple-500/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-md bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"></div>
                  <div>
                    <span className="text-sm font-bold text-smart-text block">
                      Pos Darurat
                    </span>
                    <span className="text-xs text-smart-text-muted">
                      {(pDarurat * 100).toFixed(0)}% dari Laba
                    </span>
                  </div>
                </div>
                <span className="text-base font-bold text-smart-text">
                  {formatRp(baseLaba * pDarurat)}
                </span>
              </div>
            </div>

            <button
              onClick={handleSimpanAlokasi}
              className="w-full bg-gradient-to-r ..."
            >
              <span className="material-icons-round">save</span>
              Simpan Persentase
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          BOTTOM SECTION: RIWAYAT TABEL
          ========================================= */}
      <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl overflow-hidden mt-2 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-montserrat font-bold text-xl flex items-center gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted">
              history
            </span>
            Riwayat Alokasi Bulanan
          </h3>
          <button className="text-smart-lime text-sm font-bold hover:underline hidden sm:block">
            Lihat Semua Data
          </button>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead>
              <tr className="text-smart-text-muted border-b border-smart-border/80 uppercase tracking-wider text-xs">
                <th className="pb-4 font-semibold w-1/6">Bulan</th>
                <th className="pb-4 font-semibold w-1/4">Total Laba Bersih</th>
                <th className="pb-4 font-semibold w-1/8">Pos Modal</th>
                <th className="pb-4 font-semibold w-1/8">Pos Gaji</th>
                <th className="pb-4 font-semibold w-1/8">Pos Darurat</th>
                <th className="pb-4 font-semibold w-1/6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-smart-border/50">
              {riwayat.map((row, index) => (
                <tr
                  key={index}
                  className="group hover:bg-smart-border/30 transition-colors"
                >
                  <td className="py-4 text-smart-text font-semibold">
                    {row.periode_bulan}
                  </td>
                  <td className="py-4 font-bold text-smart-lime">
                    -- Laba Bulan Ini --
                  </td>
                  <td className="py-4 text-smart-text-muted font-medium">
                    {row.persen_modal}%
                  </td>
                  <td className="py-4 text-smart-text-muted font-medium">
                    {row.persen_gaji}%
                  </td>
                  <td className="py-4 text-smart-text-muted font-medium">
                    {row.persen_tabungan}%
                  </td>
                  <td className="py-4">
                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      Tersimpan
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
