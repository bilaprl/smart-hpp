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

  useEffect(() => {
    let profileChannel;

    // Fungsi untuk menarik data nama terbaru (Dikeluarkan agar bisa dipanggil dari luar)
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

      // Tarik data pertama kali saat web diload
      await fetchName();

      // =========================================================
      // REALTIME SERVER (Supabase Realtime)
      // =========================================================
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

    // =========================================================
    // REALTIME LOKAL (Custom Event dari Modals.jsx) - SANGAT CEPAT!
    // =========================================================
    const handleLocalUpdate = () => {
      console.log("Profil berubah (Lokal)! Mengupdate Navbar...");
      fetchName();
    };

    // Dengarkan sinyal "profileUpdated" dari Modal
    window.addEventListener("profileUpdated", handleLocalUpdate);

    // Cleanup realtime jika komponen Navbar dilepas
    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      window.removeEventListener("profileUpdated", handleLocalUpdate);
    };
  }, [isLoggedIn]);

  return (
    <nav className="fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 px-6 py-3 bg-smart-card/90 backdrop-blur-md border border-smart-border rounded-full flex justify-between items-center shadow-lg transition-colors duration-300">
      {/* LOGO & MENU */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("landing")}
      >
        <span className="material-icons-round text-smart-lime text-3xl">
          ssid_chart
        </span>
        <span className="font-montserrat font-bold text-xl tracking-wide text-smart-text">
          SmartHPP
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-smart-text-muted">
        {["dashboard", "hpp", "keuangan"].map((id) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`transition-colors capitalize ${currentView === id ? "text-smart-lime font-bold" : "hover:text-smart-text"}`}
          >
            {id === "hpp" ? "Hitung HPP" : id}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
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
            <span className="material-icons-round text-lg">account_circle</span>{" "}
            Sign In
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border border-smart-border bg-smart-bg text-smart-text hover:border-smart-lime transition-colors flex items-center justify-center"
        >
          <span className="material-icons-round text-lg">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>
    </nav>
  );
}
