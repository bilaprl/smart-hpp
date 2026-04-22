"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // Pastikan path ini benar
import Navbar from "../components/Navbar";
import LandingSection from "../components/LandingSection";
import DashboardSection from "../components/DashboardSection";
import HppSection from "../components/HppSection";
import KeuanganSection from "../components/KeuanganSection";
import FaqSection from "../components/FaqSection";
import Modals from "../components/Modals";
import Footer from "../components/Footer";

export default function Home() {
  const [currentView, setCurrentView] = useState("landing");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Cek status login secara real-time (Penting untuk Google Auth)
  useEffect(() => {
    // Cek sesi awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    // Dengarkan perubahan status login (misal setelah redirect dari Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session && currentView === "landing") {
        navigate("dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  const navigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // --- FUNGSI AUTENTIKASI SUPABASE ---

  const doLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    closeModal();
  };

  const doRegister = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    alert("Berhasil mendaftar! Silakan login (atau cek email konfirmasi jika RLS mengharuskan verifikasi).");
  };

  const doGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert("Gagal login dengan Google: " + error.message);
    // Catatan: Google Auth akan me-refresh halaman, jadi closeModal tidak diperlukan di sini
  };

  const doLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setIsLoggedIn(false);
    closeModal();
    navigate("landing");
  };

  return (
    <>
      <Navbar
        currentView={currentView}
        navigate={navigate}
        isLoggedIn={isLoggedIn}
        openModal={openModal}
      />

      <main className={`flex-grow w-full relative ${currentView === "landing" ? "" : "pt-28 px-4 md:px-8"}`}>
        {currentView === "landing" && <LandingSection navigate={navigate} openModal={openModal} />}
        {currentView === "dashboard" && <DashboardSection isLoggedIn={isLoggedIn} openModal={openModal} navigate={navigate} />}
        {currentView === "hpp" && <HppSection isLoggedIn={isLoggedIn} openModal={openModal} />}
        {currentView === "keuangan" && <KeuanganSection isLoggedIn={isLoggedIn} openModal={openModal} />}
        {currentView === "faq" && <FaqSection />}
      </main>

      <Footer isLoggedIn={isLoggedIn} openModal={openModal} navigate={navigate} />

      <Modals
        activeModal={activeModal}
        closeModal={closeModal}
        doLogin={doLogin}
        doRegister={doRegister} // Kirim props baru
        doGoogleLogin={doGoogleLogin} // Kirim props baru
        doLogout={doLogout}
      />
    </>
  );
}