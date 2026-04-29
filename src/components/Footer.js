import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Footer({ isLoggedIn, openModal, navigate }) {
  // State untuk menyimpan nama user secara dinamis
  const [userName, setUserName] = useState("");

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
      setUserName(finalName);
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
        .channel(`footer-profile-sync-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            console.log("Profil berubah (Server)! Mengupdate Footer...");
            fetchName();
          },
        )
        .subscribe();
    };

    if (isLoggedIn) getProfile();

    // =========================================================
    // REALTIME LOKAL (Custom Event dari Modals.jsx)
    // =========================================================
    const handleLocalUpdate = () => {
      console.log("Profil berubah (Lokal)! Mengupdate Footer...");
      fetchName();
    };

    // Dengarkan sinyal "profileUpdated" dari Modal
    window.addEventListener("profileUpdated", handleLocalUpdate);

    // Cleanup realtime jika komponen dilepas
    return () => {
      if (profileChannel) supabase.removeChannel(profileChannel);
      window.removeEventListener("profileUpdated", handleLocalUpdate);
    };
  }, [isLoggedIn]);

  return (
    <footer className="relative w-full bg-smart-bg pt-16 pb-8 border-t border-smart-border mt-20 transition-colors duration-300">
      {/* =========================================
          MAIN FOOTER CONTENT
          ========================================= */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Kolom 1: Brand Info */}
          <div className="lg:col-span-2">
            <div
              className="flex items-center gap-2 cursor-pointer mb-6"
              onClick={() => navigate("landing")}
            >
              <span className="material-icons-round text-smart-lime text-4xl drop-shadow-[0_0_10px_rgba(212,245,66,0.5)]">
                ssid_chart
              </span>
              <span className="font-montserrat font-bold text-2xl tracking-wide text-smart-text transition-colors">
                SmartHPP
              </span>
            </div>
            <p className="text-smart-text-muted text-sm leading-relaxed mb-8 max-w-sm transition-colors">
              Sistem manajemen keuangan cerdas untuk UMKM. Hitung modal bahan
              baku, pantau laba-rugi otomatis, hingga prediksi keuntungan dalam
              satu platform.
            </p>
          </div>

          {/* Kolom 2: Fitur */}
          <div>
            <h4 className="font-montserrat font-bold text-smart-text mb-6 transition-colors">
              Fitur Utama
            </h4>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => navigate("dashboard")}
                  className="text-sm text-smart-text-muted hover:text-smart-lime transition-colors"
                >
                  Dasbor Analitik
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("hpp")}
                  className="text-sm text-smart-text-muted hover:text-smart-lime transition-colors"
                >
                  Kalkulator HPP
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("keuangan")}
                  className="text-sm text-smart-text-muted hover:text-smart-lime transition-colors"
                >
                  Manajer Alokasi Laba
                </button>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Bantuan & CTA */}
          <div>
            <h4 className="font-montserrat font-bold text-smart-text mb-6 transition-colors">
              Bantuan
            </h4>
            <ul className="space-y-4 mb-8">
              <li>
                <button
                  onClick={() => navigate("faq")}
                  className="text-sm text-smart-text-muted hover:text-smart-text transition-colors"
                >
                  Pusat Bantuan (FAQ)
                </button>
              </li>
            </ul>

            {/* CTA Pindah ke Sini */}
            {isLoggedIn ? (
              <p className="text-sm text-smart-lime font-bold italic capitalize">
                Halo, {userName}!
              </p>
            ) : (
              <button
                onClick={() => openModal("auth")}
                className="w-full sm:w-auto bg-gradient-to-r from-smart-lime to-[#b7d62b] text-smart-dark px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_4px_15px_rgba(212,245,66,0.2)]"
              >
                <span className="material-icons-round text-lg">
                  account_circle
                </span>
                Daftar / Masuk
              </button>
            )}
          </div>
        </div>

        {/* =========================================
            BOTTOM BAR
            ========================================= */}
        <div className="pt-8 border-t border-smart-border/50 flex flex-col items-center gap-4 transition-colors duration-300">
          <p className="text-smart-text-muted opacity-80 text-xs text-center w-full transition-colors">
            &copy; {new Date().getFullYear()} SmartHPP. Hak Cipta Dilindungi
            Undang-Undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
