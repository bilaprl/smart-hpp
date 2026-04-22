import { useTheme } from '../components/ThemeContext'; // Pastikan path-nya benar sesuai tempatmu menyimpan file context

export default function Navbar({ currentView, navigate, isLoggedIn, openModal }) {
  // Panggil state tema dan fungsi pengubahnya dari context
  const { theme, toggleTheme } = useTheme(); 

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'hpp', label: 'Hitung HPP' },
    { id: 'keuangan', label: 'Keuangan' },
  ];

  return (
    // Navbar menggunakan background dinamis smart-card
    <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 px-6 py-3 bg-smart-card/90 backdrop-blur-md border border-smart-border rounded-full flex justify-between items-center shadow-lg transition-colors duration-300">
      
      {/* KIRI: Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('landing')}>
        <span className="material-icons-round text-smart-lime text-3xl">ssid_chart</span>
        <span className="font-montserrat font-bold text-xl tracking-wide text-smart-text">SmartHPP</span>
      </div>

      {/* TENGAH: Menu Navigasi (Sembunyi di Mobile) */}
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-smart-text-muted">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`transition-colors ${currentView === item.id ? 'text-smart-lime font-bold' : 'hover:text-smart-text'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* KANAN: Tombol Tema & Tombol Profil/Login */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Tombol Autentikasi */}
        {isLoggedIn ? (
          <button onClick={() => openModal('profile')} className="bg-smart-bg border border-smart-border text-smart-text px-4 py-2 rounded-full font-bold text-sm flex items-center gap-3 hover:border-smart-lime transition-colors">
            <span className="hidden sm:inline">Halo, Nabila</span> 
            <div className="w-6 h-6 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-xs">N</div>
          </button>
        ) : (
          <button onClick={() => openModal('auth')} className="bg-smart-text text-smart-bg px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-lg">account_circle</span> Sign In
          </button>
        )}

        {/* Tombol Tema (Bulat, elegan, transisi smooth) */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full border border-smart-border bg-smart-bg text-smart-text hover:border-smart-lime transition-colors flex items-center justify-center"
          title={theme === 'dark' ? "Ganti ke Terang" : "Ganti ke Gelap"}
        >
          <span className="material-icons-round text-lg">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </nav>
  );
}