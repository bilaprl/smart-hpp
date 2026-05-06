import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../components/ThemeContext";

export default function Navbar({
  currentView,
  navigate,
  isLoggedIn,
  openModal,
}) {
  const { theme, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState({
    name: "User",
    initial: "U",
  });

  // STATE BARU UNTUK SIDEBAR MOBILE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let profileChannel;

    // Fungsi untuk menarik data nama terbaru
    const fetchName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("nama_owner")
        .eq("id", user.id)
        .single();

      // Prioritas: 1. Nama di database, 2. Nama dari email
      const finalName = data?.nama_owner || user.email.split("@")[0];
      setUserProfile({
        name: finalName,
        initial: finalName.charAt(0).toUpperCase(),
      });
    };

    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await fetchName();

      profileChannel = supabase
        .channel(`profile-sync-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            console.log("Profil berubah (Server)! Mengupdate Navbar...");
            fetchName();
          },
        )
        .subscribe();
    };

    if (isLoggedIn) getProfile();

    const handleLocalUpdate = () => {
      console.log("Profil berubah (Lokal)! Mengupdate Navbar...");
      fetchName();
    };

    window.addEventListener("profileUpdated", handleLocalUpdate);

    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      window.removeEventListener("profileUpdated", handleLocalUpdate);
    };
  }, [isLoggedIn]);

  // Fungsi helper untuk menavigasi sekaligus menutup sidebar (di mode mobile)
  const handleNavigate = (view) => {
    navigate(view);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 px-5 py-3 bg-smart-card/90 backdrop-blur-md border border-smart-border rounded-full flex justify-between items-center shadow-lg transition-colors duration-300">
        {/* LOGO (Kiri) */}
        <div
          className="flex items-center gap-2 cursor-pointer z-50"
          onClick={() => handleNavigate("landing")}
        >
          <span className="material-icons-round text-smart-lime text-2xl md:text-3xl">
            ssid_chart
          </span>
          <span className="font-montserrat font-bold text-lg md:text-xl tracking-wide text-smart-text">
            SmartHPP
          </span>
        </div>

        {/* MENU DESKTOP (Tengah) - Sembunyi di Mobile */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-smart-text-muted absolute left-1/2 -translate-x-1/2">
          {["dashboard", "hpp", "keuangan"].map((id) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`transition-colors capitalize ${currentView === id ? "text-smart-lime font-bold" : "hover:text-smart-text"}`}
            >
              {id === "hpp" ? "Hitung HPP" : id}
            </button>
          ))}
        </div>

        {/* BUTTONS KANAN (Desktop & Mobile) */}
        <div className="flex items-center gap-2 md:gap-4 z-50">
          {/* Tombol Tema (Selalu Muncul) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-smart-border bg-smart-bg text-smart-text hover:border-smart-lime transition-colors flex items-center justify-center"
            title="Ubah Tema"
          >
            <span className="material-icons-round text-base md:text-lg">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          {/* Tombol Login/Profil (Desktop Saja) - Di mobile pindah ke dalam Sidebar */}
          <div className="hidden lg:block">
            {isLoggedIn ? (
              <button
                onClick={() => openModal("profile")}
                className="bg-smart-bg border border-smart-border text-smart-text px-4 py-2 rounded-full font-bold text-sm flex items-center gap-3 hover:border-smart-lime transition-colors"
              >
                <span className="hidden sm:inline transition-all italic capitalize">
                  Halo, {userProfile.name}
                </span>
                <div className="w-7 h-7 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-xs shadow-sm font-black italic">
                  {userProfile.initial}
                </div>
              </button>
            ) : (
              <button
                onClick={() => openModal("auth")}
                className="bg-smart-text text-smart-bg px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="material-icons-round text-lg">
                  account_circle
                </span>{" "}
                Sign In
              </button>
            )}
          </div>

          {/* TOMBOL HAMBURGER (Mobile Saja) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-full bg-smart-bg border border-smart-border text-smart-text flex items-center justify-center hover:border-smart-lime transition-colors"
          >
            <span className="material-icons-round text-xl">
              {isSidebarOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================
          SIDEBAR MENU (MOBILE KHUSUS)
          ========================================= */}
      {/* Overlay Gelap */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Panel Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-smart-card border-l border-smart-border shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col pt-24 px-6 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Navigasi Mobile */}
        <div className="flex flex-col gap-6 font-montserrat font-bold text-lg text-smart-text-muted">
          {["dashboard", "hpp", "keuangan", "faq"].map((id) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              className={`text-left capitalize border-b border-smart-border/50 pb-4 transition-colors ${
                currentView === id ? "text-smart-lime border-smart-lime" : ""
              }`}
            >
              {id === "hpp" ? "Hitung HPP" : id}
            </button>
          ))}
        </div>

        {/* Profil/Login Mobile (Posisi di bawah Sidebar) */}
        <div className="mt-auto mb-10 pt-6 border-t border-smart-border">
          {isLoggedIn ? (
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                openModal("profile");
              }}
              className="w-full bg-smart-bg border border-smart-border text-smart-text px-4 py-3 rounded-xl font-bold flex items-center gap-4 hover:border-smart-lime transition-colors"
            >
              <div className="w-10 h-10 bg-smart-lime text-smart-dark rounded-full flex items-center justify-center text-sm shadow-sm font-black italic">
                {userProfile.initial}
              </div>
              <div className="text-left">
                <p className="text-xs text-smart-text-muted font-normal">
                  Masuk sebagai
                </p>
                <p className="italic capitalize truncate max-w-[120px]">
                  {userProfile.name}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsSidebarOpen(false);
                openModal("auth");
              }}
              className="w-full bg-smart-text text-smart-bg px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="material-icons-round">account_circle</span>
              Sign In Akun
            </button>
          )}
        </div>
      </div>
    </>
  );
}
