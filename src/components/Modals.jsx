import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Modals({
  activeModal,
  closeModal,
  doLogin,
  doRegister,
  doGoogleLogin,
  doLogout,
}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // --- STATE UNTUK TRANSAKSI ---
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [saleQty, setSaleQty] = useState("");
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isSaving, setIsSaving] = useState(false);

  // --- STATE UNTUK DATA PROFIL ---
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    initial: "",
  });
  const [loading, setLoading] = useState(false);

  // Ambil data produk & Profil saat modal dibuka
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (activeModal === "profile") {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        const displayName = data?.nama_owner || user.email.split("@")[0];
        setProfileData({
          name: displayName,
          email: user.email,
          initial: displayName.charAt(0).toUpperCase(),
        });
      }

      // AMBIL PRODUK DARI DATABASE HITUNG HPP
      if (activeModal === "transaction") {
        const { data } = await supabase
          .from("products")
          .select("id, nama_produk, harga_jual")
          .eq("user_id", user.id);
        if (data) setProductList(data);
      }
    };
    fetchData();
  }, [activeModal]);

  // FUNGSI SIMPAN TRANSAKSI KE SUPABASE
  const handleSaveTransaction = async () => {
    if (!selectedProduct || !saleQty) return alert("Isi semua data dulu ya!");

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const product = productList.find((p) => p.id === selectedProduct);
      const totalIncome = product.harga_jual * Number(saleQty);

      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          product_id: selectedProduct,
          qty_terjual: Number(saleQty),
          total_pendapatan: totalIncome,
          tanggal: saleDate,
        },
      ]);

      if (error) throw error;

      alert("Penjualan Berhasil Dicatat! 🚀");
      closeModal();
      window.location.reload(); // Agar dashboard langsung update
    } catch (err) {
      alert("Gagal simpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // FUNGSI UPDATE PROFIL KE SUPABASE
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      // Melakukan Upsert ke tabel profiles
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        nama_owner: profileData.name,
      });

      if (error) throw error;

      // TRIGGER CUSTOM EVENT AGAR NAVBAR LANGSUNG BERUBAH
      window.dispatchEvent(new Event("profileUpdated"));

      alert("Profil berhasil diperbarui! 🚀");
      closeModal();
    } catch (error) {
      alert("Gagal simpan profil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    try {
      if (isRegisterMode) {
        await doRegister(email, password);
        setIsRegisterMode(false);
      } else {
        await doLogin(email, password);
      }
    } catch (error) {
      alert(
        `Gagal ${isRegisterMode ? "Mendaftar" : "Masuk"}: ${error.message}`,
      );
    }
  };

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      {/* Modal Auth */}
      {activeModal === "auth" && (
        <div className="bg-smart-card border border-smart-border w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <div className="text-center mb-8">
            <h2 className="font-montserrat font-bold text-2xl mb-1 text-smart-text">
              {isRegisterMode
                ? "Buat Akun Baru."
                : "Selamat datang di SmartHPP."}
            </h2>
            <p className="text-sm text-smart-text-muted">
              {isRegisterMode
                ? "Daftar untuk mulai mengelola keuangan bisnismu."
                : "Masuk untuk menyimpan data finansialmu."}
            </p>
          </div>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="contoh@email.com"
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                minLength="6"
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-smart-lime text-smart-dark font-bold py-3 rounded-xl hover:bg-smart-lime-hover transition-colors mt-2"
            >
              {isRegisterMode ? "Daftar Sekarang" : "Masuk Sekarang"}
            </button>
          </form>

          {/* --- TOMBOL GOOGLE LOGIN --- */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-smart-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-smart-card text-smart-text-muted font-medium">Atau lanjutkan dengan</span>
              </div>
            </div>

            <button
              type="button"
              onClick={doGoogleLogin}
              className="w-full mt-6 bg-smart-bg border border-smart-border text-smart-text font-bold py-3 rounded-xl hover:border-smart-lime transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              {/* Logo Google SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Masuk dengan Google
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-smart-text-muted">
            {isRegisterMode ? "Sudah punya akun? " : "Belum punya akun? "}
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-smart-lime font-bold hover:underline"
            >
              {isRegisterMode ? "Masuk di sini" : "Daftar sekarang"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Profile */}
      {activeModal === "profile" && (
        <div className="bg-smart-card border border-smart-border w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-md italic">
              {profileData.initial}
            </div>
            <h3 className="font-montserrat font-bold text-xl text-smart-text">
              {profileData.name}
            </h3>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Nama Bisnis / Nama Owner
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm focus:outline-none text-smart-text-muted transition-colors opacity-60"
                readOnly
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="flex-1 bg-smart-text text-smart-bg font-bold py-2.5 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              onClick={doLogout}
              className="flex-1 border border-red-500 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL TRANSACTION --- */}
      {activeModal === "transaction" && (
        <div className="bg-smart-card border border-smart-border w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>
          <h2 className="font-montserrat font-bold text-xl mb-6 text-smart-text">
            Catat Penjualan Terbaru
          </h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Pilih Produk Laku
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors cursor-pointer"
              >
                <option value="">-- Pilih Produk dari Hitung HPP --</option>
                {productList.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nama_produk} (Rp{" "}
                    {prod.harga_jual.toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">
                Kuantitas Terjual
              </label>
              <input
                type="number"
                placeholder="Masukan jumlah..."
                value={saleQty}
                onChange={(e) => setSaleQty(e.target.value)}
                className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleSaveTransaction}
            disabled={isSaving}
            className="w-full bg-smart-lime text-smart-dark font-bold py-3 rounded-xl hover:bg-smart-lime-hover transition-colors disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan Penjualan"}
          </button>
        </div>
      )}
    </div>
  );
}