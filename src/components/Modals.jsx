import { useState } from 'react';

export default function Modals({ activeModal, closeModal, doLogin, doRegister, doGoogleLogin, doLogout }) {
  // State untuk berpindah antara mode Login dan Register
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  if (!activeModal) return null;

  // Handler gabungan untuk form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    try {
      if (isRegisterMode) {
        await doRegister(email, password);
        setIsRegisterMode(false); // Balik ke mode login setelah daftar berhasil
      } else {
        await doLogin(email, password);
      }
    } catch (error) {
      alert(`Gagal ${isRegisterMode ? 'Mendaftar' : 'Masuk'}: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
      {/* Modal Auth */}
      {activeModal === 'auth' && (
        <div className="bg-smart-card border border-smart-border w-full max-w-md rounded-3xl p-8 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button onClick={closeModal} className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors">
            <span className="material-icons-round">close</span>
          </button>
          <div className="text-center mb-8">
            <h2 className="font-montserrat font-bold text-2xl mb-1 text-smart-text">
              {isRegisterMode ? "Buat Akun Baru." : "Selamat datang di SmartHPP."}
            </h2>
            <p className="text-sm text-smart-text-muted">
              {isRegisterMode ? "Daftar untuk mulai mengelola keuangan bisnismu." : "Masuk untuk menyimpan data finansialmu."}
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Email</label>
              <input type="email" placeholder="contoh@email.com" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Password</label>
              <input type="password" placeholder="Minimal 6 karakter" minLength="6" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors" required />
            </div>
            <button type="submit" className="w-full bg-smart-lime text-smart-dark font-bold py-3 rounded-xl hover:bg-smart-lime-hover transition-colors mt-2">
              {isRegisterMode ? "Daftar Sekarang" : "Masuk Sekarang"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-smart-text-muted">
            <div className="h-px bg-smart-border flex-grow transition-colors"></div>
            <span>Atau</span>
            <div className="h-px bg-smart-border flex-grow transition-colors"></div>
          </div>

          <button onClick={doGoogleLogin} className="w-full bg-smart-text text-smart-bg font-bold py-3 rounded-xl hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Lanjutkan dengan Google
          </button>
          
          <p className="text-center text-sm text-smart-text-muted mt-6">
            {isRegisterMode ? "Sudah Memiliki Akun? " : "Belum Memiliki Akun? "}
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)} 
              className="text-smart-lime font-bold hover:underline"
            >
              {isRegisterMode ? "Masuk di sini" : "Daftar Sekarang"}
            </button>
          </p>
        </div>
      )}

      {/* Modal Profile */}
      {activeModal === 'profile' && (
        <div className="bg-smart-card border border-smart-border w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button onClick={closeModal} className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors">
            <span className="material-icons-round">close</span>
          </button>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-md">N</div>
            <h3 className="font-montserrat font-bold text-xl text-smart-text">Nabila</h3>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Nama Bisnis / Nama Owner</label>
              <input type="text" defaultValue="Nabila" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Email</label>
              <input type="email" defaultValue="nabila@gmail.com" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-smart-lime text-smart-text transition-colors" readOnly />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={closeModal} className="flex-1 bg-smart-text text-smart-bg font-bold py-2.5 rounded-xl hover:opacity-80 transition-opacity">Simpan</button>
            <button onClick={doLogout} className="flex-1 border border-red-500 text-red-500 font-bold py-2.5 rounded-xl hover:bg-red-500/10 transition-colors">Keluar</button>
          </div>
        </div>
      )}

      {/* Modal Transaction */}
      {activeModal === 'transaction' && (
        <div className="bg-smart-card border border-smart-border w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-fade-in transition-colors duration-300">
          <button onClick={closeModal} className="absolute top-4 right-4 text-smart-text-muted hover:text-smart-text transition-colors">
            <span className="material-icons-round">close</span>
          </button>
          <h2 className="font-montserrat font-bold text-xl mb-6 text-smart-text">Catat Penjualan Terbaru</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Tanggal</label>
              <input type="date" defaultValue="2026-04-04" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Pilih Produk Laku</label>
              <select className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors">
                <option>Kopi Susu Gula Aren</option>
                <option>Kemeja Flanel Kotak</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-smart-text-muted mb-1">Kuantitas Terjual</label>
              <input type="number" defaultValue="20" className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-2.5 text-sm text-smart-text focus:outline-none focus:border-smart-lime transition-colors" />
            </div>
          </div>
          <button onClick={closeModal} className="w-full bg-smart-lime text-smart-dark font-bold py-3 rounded-xl hover:bg-smart-lime-hover transition-colors">
            Simpan Penjualan
          </button>
        </div>
      )}
    </div>
  );
}