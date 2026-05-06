import { supabase } from "../lib/supabase";
import { useState, useEffect, useCallback } from "react";

export default function KeuanganSection({ isLoggedIn, openModal }) {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [baseLaba, setBaseLaba] = useState(0);
  const [valModal, setValModal] = useState(50);
  const [valGaji, setValGaji] = useState(30);
  const [valDarurat, setValDarurat] = useState(20);
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE BARU: Untuk menyimpan pilihan bulan (Default: 04 untuk April)
  const [selectedMonth, setSelectedMonth] = useState("04");

  // Helper Format Rupiah
  const formatRp = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

  // Perhitungan Persentase Dinamis
  const total = Number(valModal) + Number(valGaji) + Number(valDarurat) || 1;
  const pModal = valModal / total;
  const pGaji = valGaji / total;
  const pDarurat = valDarurat / total;

  // ==========================================
  // FUNGSI HITUNG LABA DENGAN FILTER BULAN
  // ==========================================
  const calculateLaba = useCallback(async (userId, month) => {
    try {
      // LOGIKA PENANGGALAN MIS
      const year = 2026;
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      const { data: trans, error: tError } = await supabase
        .from("transactions")
        .select("total_pendapatan, qty_terjual, products!inner(hpp_per_unit)")
        .eq("user_id", userId)
        .gte("tanggal", startDate)
        .lte("tanggal", endDate); // Filter berdasarkan bulan aktif

      if (!tError && trans) {
        let totalIn = 0;
        let totalHpp = 0;

        trans.forEach((t) => {
          const income = Number(t.total_pendapatan) || 0;
          const hppSatuan = Number(t.products?.hpp_per_unit) || 0;
          const expense = hppSatuan * (Number(t.qty_terjual) || 0);

          totalIn += income;
          totalHpp += expense;
        });

        const labaBersihDashboard = totalIn - totalHpp;
        setBaseLaba(labaBersihDashboard > 0 ? labaBersihDashboard : 0);
      }
    } catch (err) {
      console.error("Gagal sinkronasi laba:", err);
    }
  }, []);

  // ==========================================
  // INITIAL LOAD & REALTIME SUBSCRIPTION
  // ==========================================
  useEffect(() => {
    let transactionChannel;

    const initData = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Ambil data laba awal (Berdasarkan selectedMonth)
      await calculateLaba(user.id, selectedMonth);

      // 2. Ambil Riwayat Alokasi
      const { data: allocations, error: aError } = await supabase
        .from("allocations")
        .select("*")
        .eq("user_id", user.id)
        .order("periode_bulan", { ascending: false });

      if (!aError && allocations && allocations.length > 0) {
        setRiwayat(allocations);
        // Set slider ke posisi terakhir tersimpan
        setValModal(allocations[0].persen_modal);
        setValGaji(allocations[0].persen_gaji);
        setValDarurat(allocations[0].persen_tabungan);
      } else {
        setRiwayat([]);
      }

      // 3. Setup Realtime: Dengarkan perubahan di Dashboard
      transactionChannel = supabase
        .channel(`schema-db-changes-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log(
              "Perubahan terdeteksi di Dashboard! Update keuangan...",
            );
            calculateLaba(user.id, selectedMonth);
          },
        )
        .subscribe();

      setIsLoading(false);
    };

    if (isLoggedIn) initData();

    return () => {
      if (transactionChannel) supabase.removeChannel(transactionChannel);
    };
  }, [isLoggedIn, calculateLaba, selectedMonth]); // <--- selectedMonth masuk ke dependency agar kereload otomatis saat diganti

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const handleSimpanAlokasi = async () => {
    if (!isLoggedIn) return openModal("auth");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (baseLaba <= 0) {
      alert(
        `Laba bulan ${selectedMonth === "04" ? "April" : "Mei"} masih Rp 0, catat penjualan dulu di Dashboard!`,
      );
      return;
    }

    // Set tanggal simpan sesuai bulan yang sedang dipilih
    const periodeSimpan = `2026-${selectedMonth}-01`;

    const { error } = await supabase.from("allocations").insert([
      {
        user_id: user.id,
        periode_bulan: periodeSimpan,
        persen_modal: Math.round(Number(valModal)),
        persen_gaji: Math.round(Number(valGaji)),
        persen_tabungan: Math.round(Number(valDarurat)),
        total_laba_saat_ini: Math.round(baseLaba),
      },
    ]);

    if (!error) {
      alert("Alokasi Laba Berhasil Disimpan! 🚀");
      window.location.reload();
    } else {
      alert("Gagal simpan: " + error.message);
    }
  };

  // ==========================================
  // RENDER: GUEST MODE
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in w-full max-w-7xl mx-auto pb-16 md:pb-20 mt-6 md:mt-10 px-4 sm:px-6">
        <div className="bg-smart-card border border-smart-border p-6 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-20 -bottom-20 w-48 h-48 md:w-64 md:h-64 bg-purple-500/5 blur-[80px] md:blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-10 md:gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left z-10">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-red-500/20 shadow-lg">
                <span className="material-icons-round text-3xl md:text-4xl">
                  lock
                </span>
              </div>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl text-smart-text mb-4 md:mb-6 leading-tight">
                Kelola Laba Bersih{" "}
                <span className="text-smart-lime italic font-serif">
                  {" "}
                  Lebih Terstruktur.
                </span>
              </h2>
              <p className="text-smart-text-muted mb-8 md:mb-10 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg transition-colors">
                Bagi hasil jualan Anda ke pos{" "}
                <b>Modal, Gaji, dan Dana Darurat</b> secara otomatis. Jangan
                biarkan uang usaha dan pribadi tercampur lagi!
              </p>
              <button
                onClick={() => openModal("auth")}
                className="bg-smart-text text-smart-bg font-black px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl hover:scale-105 transition-all duration-300 text-base md:text-lg shadow-xl flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center"
              >
                Mulai Alokasi Sekarang
              </button>
            </div>
            <div className="w-full lg:w-1/2 relative z-10 mt-6 lg:mt-0">
              <div className="relative bg-smart-bg border-4 border-smart-border rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden transform lg:-rotate-2 group-hover:rotate-0 transition-transform duration-500">
                <img
                  src="/Keuangan.png"
                  alt="Preview"
                  className="w-full h-auto object-cover opacity-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: LOGGED IN MODE
  // ==========================================
  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-16 md:pb-20 flex flex-col gap-6 md:gap-8 px-4 sm:px-6">
      {/* HEADER CARD */}
      <div className="bg-smart-card border border-smart-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-5 md:gap-6 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 w-full md:w-auto">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-smart-lime/10 flex items-center justify-center border border-smart-lime/20 hidden sm:flex flex-shrink-0">
            <span className="material-icons-round text-smart-lime text-2xl md:text-3xl">
              account_balance_wallet
            </span>
          </div>
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h2 className="font-montserrat font-bold text-xl md:text-2xl text-smart-text mb-1">
              Manajer Alokasi Laba
            </h2>
            <p className="text-smart-text-muted text-xs md:text-sm mb-3 md:mb-4 px-2 sm:px-0">
              Terhubung secara realtime dengan performa Dashboard Anda.
            </p>
            {/* DROPDOWN FILTER BULAN */}
            <div className="relative inline-block w-full sm:w-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto bg-smart-bg border border-smart-border text-xs md:text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 md:py-2 focus:outline-none focus:border-smart-lime text-smart-text appearance-none cursor-pointer transition-colors"
              >
                <option value="04">April 2026</option>
                <option value="05">Mei 2026</option>
              </select>
              <span className="material-icons-round absolute right-3 top-2.5 md:top-2 text-smart-text-muted pointer-events-none text-base md:text-lg">
                calendar_today
              </span>
            </div>
          </div>
        </div>
        <div className="text-center md:text-right w-full md:w-auto bg-smart-bg p-4 md:p-5 rounded-xl md:rounded-2xl border border-smart-border shadow-inner transition-colors">
          <p className="text-smart-text-muted text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 md:mb-1.5">
            Total Laba Bersih ({selectedMonth === "04" ? "April" : "Mei"})
          </p>
          <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl md:text-4xl text-smart-lime drop-shadow-md truncate">
            {isLoading ? "..." : formatRp(baseLaba)}
          </h1>
        </div>
      </div>

      {/* CONTROLS & VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* LEFT: SLIDERS */}
        <div className="bg-smart-card border border-smart-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted text-xl md:text-2xl">
              tune
            </span>{" "}
            Atur Persentase Alokasi
          </h3>
          <div className="space-y-6 md:space-y-10">
            <div>
              <div className="flex justify-between items-end mb-2.5 md:mb-3">
                <h4 className="font-bold text-sm md:text-base text-smart-text">
                  Pos Modal
                </h4>
                <span className="font-bold text-smart-lime text-lg md:text-xl bg-smart-bg px-2.5 md:px-3 py-1 rounded-lg border border-smart-border transition-colors">
                  {(pModal * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={valModal}
                onChange={(e) => setValModal(e.target.value)}
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-smart-lime"
              />
              <p className="text-right text-xs md:text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pModal)}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2.5 md:mb-3">
                <h4 className="font-bold text-sm md:text-base text-smart-text">
                  Pos Gaji Pemilik
                </h4>
                <span className="font-bold text-blue-500 text-lg md:text-xl bg-smart-bg px-2.5 md:px-3 py-1 rounded-lg border border-smart-border transition-colors">
                  {(pGaji * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={valGaji}
                onChange={(e) => setValGaji(e.target.value)}
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-right text-xs md:text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pGaji)}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2.5 md:mb-3">
                <h4 className="font-bold text-sm md:text-base text-smart-text">
                  Pos Dana Darurat
                </h4>
                <span className="font-bold text-purple-500 text-lg md:text-xl bg-smart-bg px-2.5 md:px-3 py-1 rounded-lg border border-smart-border transition-colors">
                  {(pDarurat * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={valDarurat}
                onChange={(e) => setValDarurat(e.target.value)}
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-right text-xs md:text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pDarurat)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: VISUALIZATION */}
        <div className="bg-smart-card border border-smart-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl flex flex-col transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-2 md:gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted text-xl md:text-2xl">
              donut_large
            </span>{" "}
            Visualisasi Alokasi
          </h3>
          <div className="w-full h-8 md:h-12 rounded-full overflow-hidden flex bg-smart-bg mb-8 md:mb-10 border border-smart-border shadow-inner relative transition-colors">
            <div
              className="bg-smart-lime h-full transition-all duration-500"
              style={{ width: `${pModal * 100}%` }}
            ></div>
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${pGaji * 100}%` }}
            ></div>
            <div
              className="bg-purple-500 h-full transition-all duration-500"
              style={{ width: `${pDarurat * 100}%` }}
            ></div>
          </div>
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {[
              {
                label: "Pos Modal",
                color: "bg-smart-lime",
                val: baseLaba * pModal,
              },
              {
                label: "Pos Gaji",
                color: "bg-blue-500",
                val: baseLaba * pGaji,
              },
              {
                label: "Pos Darurat",
                color: "bg-purple-500",
                val: baseLaba * pDarurat,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 md:p-4 bg-smart-bg rounded-xl md:rounded-2xl border border-smart-border transition-colors"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${item.color}`}
                  ></div>
                  <span className="text-xs md:text-sm font-bold text-smart-text">
                    {item.label}
                  </span>
                </div>
                <span className="text-sm md:text-base font-bold text-smart-text">
                  {formatRp(item.val)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleSimpanAlokasi}
            className="w-full bg-smart-text text-smart-bg font-black py-3.5 md:py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg flex justify-center items-center gap-2 mt-auto text-sm md:text-base"
          >
            <span className="material-icons-round text-base md:text-lg">
              save
            </span>{" "}
            Simpan Alokasi {selectedMonth === "04" ? "April" : "Mei"}
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-smart-card border border-smart-border p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl overflow-hidden transition-colors duration-300">
        <h3 className="font-montserrat font-bold text-lg md:text-xl flex items-center gap-2 md:gap-3 text-smart-text mb-4 md:mb-6">
          <span className="material-icons-round text-smart-text-muted text-xl md:text-2xl">
            history
          </span>{" "}
          Riwayat Alokasi Bulanan
        </h3>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left text-sm min-w-[650px] md:min-w-[750px]">
            <thead>
              <tr className="text-smart-text-muted border-b border-smart-border/80 uppercase tracking-wider text-[10px] md:text-xs">
                <th className="pb-3 md:pb-4 font-semibold">Bulan Alokasi</th>
                <th className="pb-3 md:pb-4 font-semibold">Laba Saat Itu</th>
                <th className="pb-3 md:pb-4 font-semibold text-center">
                  Modal
                </th>
                <th className="pb-3 md:pb-4 font-semibold text-center">Gaji</th>
                <th className="pb-3 md:pb-4 font-semibold text-center">
                  Tabungan
                </th>
                <th className="pb-3 md:pb-4 font-semibold text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-smart-border/50">
              {riwayat.length > 0 ? (
                riwayat.map((row, index) => (
                  <tr
                    key={index}
                    className="group hover:bg-smart-border/30 transition-colors"
                  >
                    <td className="py-3 md:py-4 text-smart-text font-semibold text-xs md:text-sm">
                      {new Date(row.periode_bulan).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 md:py-4 font-bold text-smart-lime text-xs md:text-sm">
                      {formatRp(row.total_laba_saat_ini || 0)}
                    </td>
                    <td className="py-3 md:py-4 text-center text-smart-text-muted text-xs md:text-sm">
                      {row.persen_modal}%
                    </td>
                    <td className="py-3 md:py-4 text-center text-smart-text-muted text-xs md:text-sm">
                      {row.persen_gaji}%
                    </td>
                    <td className="py-3 md:py-4 text-center text-smart-text-muted text-xs md:text-sm">
                      {row.persen_tabungan}%
                    </td>
                    <td className="py-3 md:py-4 text-right">
                      <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">
                        Tersimpan
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-8 md:py-10 text-center text-smart-text-muted font-semibold italic opacity-50 text-xs md:text-sm"
                  >
                    Belum ada riwayat alokasi laba.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
