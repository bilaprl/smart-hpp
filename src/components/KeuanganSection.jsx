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

  // Helper Format Rupiah
  const formatRp = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

  // Perhitungan Persentase Dinamis
  const total = Number(valModal) + Number(valGaji) + Number(valDarurat) || 1;
  const pModal = valModal / total;
  const pGaji = valGaji / total;
  const pDarurat = valDarurat / total;

  // ==========================================
  // FUNGSI HITUNG LABA (SINKRON DASHBOARD)
  // ==========================================
  const calculateLaba = useCallback(async (userId) => {
    try {
      const { data: trans, error: tError } = await supabase
        .from("transactions")
        .select("total_pendapatan, qty_terjual, products!inner(hpp_per_unit)")
        .eq("user_id", userId);

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

      // 1. Ambil data laba awal
      await calculateLaba(user.id);

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
      }

      // 3. Setup Realtime: Dengarkan perubahan di Dashboard
      transactionChannel = supabase
        .channel(`schema-db-changes-${Date.now()}`) // <--- Buat namanya selalu unik
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
            calculateLaba(user.id);
          },
        )
        .subscribe();

      setIsLoading(false);
    };

    if (isLoggedIn) initData();

    // Cleanup saat pindah halaman
    return () => {
      if (transactionChannel) supabase.removeChannel(transactionChannel);
    };
  }, [isLoggedIn, calculateLaba]);

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
      alert("Laba kamu masih Rp 0, catat penjualan dulu di Dashboard!");
      return;
    }

    const { error } = await supabase.from("allocations").insert([
      {
        user_id: user.id,
        periode_bulan: new Date().toISOString().split("T")[0],
        persen_modal: Math.round(Number(valModal)),
        persen_gaji: Math.round(Number(valGaji)),
        persen_tabungan: Math.round(Number(valDarurat)),
        total_laba_saat_ini: Math.round(baseLaba), // Menggunakan kolom bigint yang baru ditambah
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
      <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 mt-10 px-4">
        <div className="bg-smart-card border border-smart-border p-8 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group transition-colors duration-300">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-8 border border-red-500/20 shadow-lg">
                <span className="material-icons-round text-4xl">lock</span>
              </div>
              <h2 className="font-montserrat font-black text-3xl md:text-5xl text-smart-text mb-6 leading-tight">
                Kelola Laba Bersih{" "}
                <span className="text-smart-lime italic font-serif">
                  {" "}
                  Lebih Terstruktur.
                </span>
              </h2>
              <p className="text-smart-text-muted mb-10 text-lg leading-relaxed max-w-lg transition-colors">
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
            <div className="w-full lg:w-1/2 relative z-10">
              <div className="relative bg-smart-bg border-4 border-smart-border rounded-[2rem] shadow-2xl overflow-hidden transform lg:-rotate-2 group-hover:rotate-0 transition-transform duration-500">
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
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20 flex flex-col gap-8 px-4">
      {/* HEADER CARD */}
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
              Terhubung secara realtime dengan performa Dashboard Anda.
            </p>
          </div>
        </div>
        <div className="text-left md:text-right w-full md:w-auto bg-smart-bg p-5 rounded-2xl border border-smart-border shadow-inner transition-colors">
          <p className="text-smart-text-muted text-xs font-bold uppercase tracking-wider mb-1">
            Total Laba Bersih 
          </p>
          <h1 className="font-montserrat font-extrabold text-3xl md:text-4xl text-smart-lime drop-shadow-md">
            {isLoading ? "..." : formatRp(baseLaba)}
          </h1>
        </div>
      </div>

      {/* CONTROLS & VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: SLIDERS */}
        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-xl mb-8 flex items-center gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted">
              tune
            </span>{" "}
            Atur Persentase Alokasi
          </h3>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-base text-smart-text">
                  Pos Modal
                </h4>
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
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-smart-lime"
              />
              <p className="text-right text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pModal)}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-base text-smart-text">
                  Pos Gaji Pemilik
                </h4>
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
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-right text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pGaji)}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-base text-smart-text">
                  Pos Dana Darurat
                </h4>
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
                className="w-full h-2 bg-smart-bg rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-right text-sm text-smart-text-muted font-semibold mt-2">
                {formatRp(baseLaba * pDarurat)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: VISUALIZATION */}
        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col transition-colors duration-300">
          <h3 className="font-montserrat font-bold text-xl mb-8 flex items-center gap-3 text-smart-text">
            <span className="material-icons-round text-smart-text-muted">
              donut_large
            </span>{" "}
            Visualisasi Alokasi
          </h3>
          <div className="w-full h-12 rounded-full overflow-hidden flex bg-smart-bg mb-10 border border-smart-border shadow-inner relative transition-colors">
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
          <div className="space-y-4 mb-8">
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
                className="flex justify-between items-center p-4 bg-smart-bg rounded-2xl border border-smart-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-bold text-smart-text">
                    {item.label}
                  </span>
                </div>
                <span className="text-base font-bold text-smart-text">
                  {formatRp(item.val)}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleSimpanAlokasi}
            className="w-full bg-smart-text text-smart-bg font-black py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg flex justify-center items-center gap-2 mt-auto"
          >
            <span className="material-icons-round">save</span> Simpan Persentase
            Alokasi
          </button>
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl overflow-hidden transition-colors duration-300">
        <h3 className="font-montserrat font-bold text-xl flex items-center gap-3 text-smart-text mb-6">
          <span className="material-icons-round text-smart-text-muted">
            history
          </span>{" "}
          Riwayat Alokasi Bulanan
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead>
              <tr className="text-smart-text-muted border-b border-smart-border/80 uppercase tracking-wider text-xs">
                <th className="pb-4 font-semibold">Bulan Alokasi</th>
                <th className="pb-4 font-semibold">Laba Saat Itu</th>
                <th className="pb-4 font-semibold text-center">Modal</th>
                <th className="pb-4 font-semibold text-center">Gaji</th>
                <th className="pb-4 font-semibold text-center">Tabungan</th>
                <th className="pb-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-smart-border/50">
              {riwayat.map((row, index) => (
                <tr
                  key={index}
                  className="group hover:bg-smart-border/30 transition-colors"
                >
                  <td className="py-4 text-smart-text font-semibold">
                    {new Date(row.periode_bulan).toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 font-bold text-smart-lime">
                    {formatRp(row.total_laba_saat_ini || 0)}
                  </td>
                  <td className="py-4 text-center text-smart-text-muted">
                    {row.persen_modal}%
                  </td>
                  <td className="py-4 text-center text-smart-text-muted">
                    {row.persen_gaji}%
                  </td>
                  <td className="py-4 text-center text-smart-text-muted">
                    {row.persen_tabungan}%
                  </td>
                  <td className="py-4 text-right">
                    <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">
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
