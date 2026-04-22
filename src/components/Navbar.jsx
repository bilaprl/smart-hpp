import { useState, useEffect } from 'react'; // Tambahkan useState & useEffect
import { supabase } from '../lib/supabase'; // Import supabase
import { useTheme } from '../components/ThemeContext';

export default function Navbar({ currentView, navigate, isLoggedIn, openModal }) {
  const { theme, toggleTheme } = useTheme(); 
  
  // STATE BARU: Untuk menyimpan nama user asli
  const [userProfile, setUserProfile] = useState({
    name: "User",
    initial: "U"
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'hpp', label: 'Hitung HPP' },
    { id: 'keuangan', label: 'Keuangan' },
  ];

  // Efek untuk mengambil nama user asli dari database
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Ambil data dari tabel profiles yang id-nya cocok dengan user login
        const { data, error } = await supabase
          .from('profiles')
          .select('nama_owner')
          .eq('id', user.id)
          .single();

        if (data && data.nama_owner) {
          setUserProfile({
            name: data.nama_owner,
            initial: data.nama_owner.charAt(0).toUpperCase()
          });
        } else {
          // Fallback jika profile belum terbuat, ambil dari email
          const nameFromEmail = user.email.split('@')[0];
          setUserProfile({
            name: nameFromEmail,
            initial: nameFromEmail.charAt(0).toUpperCase()
          });
        }
      }
    };

    if (isLoggedIn) {
      getProfile();
    }
  }, [isLoggedIn]);

  return (
    <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 px-6 py-3 bg-smart-card/90 backdrop-blur-md border border-smart-border rounded-full flex justify-between items-center shadow-lg transition-colors duration-300">
      
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('landing')}>
        <span className="material-icons-round text-smart-lime text-3xl">ssid_chart</span>
        <span className="font-montserrat font-bold text-xl tracking-wide text-smart-text">SmartHPP</span>
      </div>

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

      <div className="flex items-center gap-3 md:gap-4">
        {isLoggedIn ? (
          <button onClick={() => openModal('profile')} className="bg-smart-bg border border-smart-border text-smart-text px-4 py-2 rounded-full font-bold text-sm flex items-center gap-3 hover:border-smart-lime transition-colors">
            {/* PERUBAHAN DI SINI: Menggunakan data dinamis */}
            <span className="hidden sm:inline transition-all italic">Halo, {userProfile.name}</span> 
            <div className="w-7 h-7 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-xs shadow-sm font-black">
              {userProfile.initial}
            </div>
          </button>
        ) : (
          <button onClick={() => openModal('auth')} className="bg-smart-text text-smart-bg px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-lg">account_circle</span> Sign In
          </button>
        )}

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
