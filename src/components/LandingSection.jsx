export default function LandingSection({ navigate, openModal }) {
  return (
    <div className="animate-fade-in w-full flex flex-col">
      {/* SECTION 1: HERO */}
      <section className="relative w-full bg-smart-bg px-6 py-24 md:px-16 lg:px-24 flex flex-col md:flex-row items-center justify-between gap-12 transition-colors duration-300">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative z-10 w-full md:w-1/2 flex flex-col items-start text-left">
         <div className="border border-smart-border rounded-full px-5 py-1.5 text-sm font-medium text-smart-text-muted mb-7 backdrop-blur-sm mt-9 transition-colors">
            Solusi <span className="text-smart-lime">Finansial.</span>
          </div>
          <h1 className="font-montserrat text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.15] text-smart-text mb-6 transition-colors">
            Satu Aplikasi untuk Semua Urusan{" "}
            <span className="font-serif italic font-extrabold text-5xl md:text-6xl lg:text-[4rem]">
              Keuangan
            </span>{" "}
            Usahamu.
          </h1>
          <p className="text-smart-text-muted text-base md:text-lg mb-10 leading-relaxed max-w-lg transition-colors">
            Sistem manajemen keuangan cerdas untuk UMKM. Hitung modal bahan
            baku, pantau laba-rugi otomatis, hingga prediksi keuntungan masa
            depan semua dalam satu tempat.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => openModal("auth")}
              className="bg-gradient-to-r from-smart-lime to-[#b7d62b] text-smart-dark font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(212,245,66,0.3)] w-full sm:w-auto text-lg"
            >
              Daftar Sekarang
            </button>
            <button
              onClick={() => navigate("hpp")}
              className="bg-transparent border border-smart-border text-smart-text font-bold px-8 py-4 rounded-full hover:bg-smart-border transition-colors w-full sm:w-auto text-lg backdrop-blur-sm"
            >
              Mulai Uji Coba
            </button>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="absolute inset-0 bg-smart-lime/20 blur-[100px] rounded-full w-3/4 h-3/4 m-auto"></div>

          <div className="relative w-full max-w-lg aspect-[4/3] bg-smart-card border border-smart-border rounded-3xl shadow-2xl overflow-hidden group transition-colors">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-opacity duration-500"></div>
            <div className="absolute inset-0 border-2 border-smart-lime/40 rounded-3xl m-2 opacity-80"></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PAIN POINTS */}
      <section className="relative w-full bg-smart-card px-6 py-28 flex flex-col items-center text-center overflow-hidden transition-colors duration-300">
        <div
          className="absolute left-4 md:left-12 top-1/4 w-32 h-48 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#D4F542 3px, transparent 3px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div
          className="absolute right-4 md:right-12 bottom-1/4 w-32 h-48 opacity-30 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#D4F542 3px, transparent 3px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <h2 className="font-montserrat text-3xl md:text-[2.75rem] font-semibold text-smart-text z-10 leading-tight mb-20 max-w-4xl transition-colors">
          Masih pusing{" "}
          <span className="font-serif italic font-bold text-4xl md:text-[3.5rem] mx-1">
            uang
          </span>{" "}
          usaha dan <br className="hidden md:block" /> pribadi tercampur?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto text-left z-10 px-4">
          <div className="flex items-start gap-4">
            <span className="material-icons-round text-3xl text-smart-text mt-1 border border-smart-border rounded-full p-1 transition-colors">
              sentiment_dissatisfied
            </span>
            <p className="text-smart-text-muted font-medium text-lg leading-relaxed transition-colors">
              Susah tentukan harga jual karena bingung hitung HPP bahan baku.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <span className="material-icons-round text-3xl text-smart-text mt-1 border border-smart-border rounded-full p-1 transition-colors">
              sentiment_dissatisfied
            </span>
            <p className="text-smart-text-muted font-medium text-lg leading-relaxed transition-colors">
              Tiap bulan merasa jualan ramai, tapi uangnya tidak terlihat.
            </p>
          </div>
          <div className="flex items-start gap-4">
            <span className="material-icons-round text-3xl text-smart-text mt-1 border border-smart-border rounded-full p-1 transition-colors">
              sentiment_dissatisfied
            </span>
            <p className="text-smart-text-muted font-medium text-lg leading-relaxed transition-colors">
              Ribet harus pakai standar satuan akuntansi yang kaku.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section className="relative w-full bg-smart-bg px-6 py-28 flex flex-col items-center border-t border-smart-border transition-colors duration-300">
        <h2 className="font-montserrat text-3xl md:text-[2.75rem] font-semibold text-smart-text mb-4 text-center transition-colors">
          Tenang,{" "}
          <span className="font-serif italic font-bold text-4xl md:text-[3.5rem] mx-1">
            masalah
          </span>{" "}
          mu bakal teratasi!
        </h2>
        <p className="text-smart-text-muted font-medium mb-16 text-lg text-center transition-colors">
          Disini kami menyediakan solusi finansial.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12 w-full max-w-6xl px-4">
          {/* Card 1 */}
          <div className="bg-smart-card text-smart-text p-8 rounded-3xl relative shadow-xl h-full flex flex-col border border-smart-border transition duration-500 hover:border-smart-lime hover:shadow-[0_0_20px_rgba(212,245,66,0.3)]">
            <h3 className="font-montserrat font-bold text-xl mb-4">
              HPP Super Fleksibel
            </h3>
            <p className="text-smart-text-muted text-base leading-relaxed mb-8">
              Hitung biaya jual atau racik bahan bebas, tanpa batasan satuan
              untuk Produksi, Retail, dan Jasa.
            </p>
            <div className="absolute -bottom-5 right-6 bg-smart-card border border-smart-lime p-3 rounded-2xl shadow-[0_0_15px_rgba(212,245,66,0.15)] flex items-center justify-center transition-colors">
              <span className="material-icons-round text-smart-lime text-3xl">
                calculate
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-smart-card text-smart-text p-8 rounded-3xl relative shadow-xl h-full flex flex-col border border-smart-border transition duration-500 hover:border-smart-lime hover:shadow-[0_0_20px_rgba(212,245,66,0.3)]">
            <h3 className="font-montserrat font-bold text-xl mb-4">
              Alokasi Dompet Otomatis
            </h3>
            <p className="text-smart-text-muted text-base leading-relaxed mb-8">
              Laba bersih yang didapat langsung terbagi ke modal usaha, gaji
              pemilik, dan dana darurat secara proporsional.
            </p>
            <div className="absolute -bottom-5 right-6 bg-smart-card border border-smart-lime p-3 rounded-2xl shadow-[0_0_15px_rgba(212,245,66,0.15)] flex items-center justify-center transition-colors">
              <span className="material-icons-round text-smart-lime text-3xl">
                account_balance_wallet
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-smart-card text-smart-text p-8 rounded-3xl relative shadow-xl h-full flex flex-col border border-smart-border transition duration-500 hover:border-smart-lime hover:shadow-[0_0_20px_rgba(212,245,66,0.3)]">
            <h3 className="font-montserrat font-bold text-xl mb-4">
              Pencatatan Transaksi
            </h3>
            <p className="text-smart-text-muted text-base leading-relaxed mb-8">
              Rekap hasil jualan dan kunci history harga dengan mudah tanpa
              merusak data lampau saat harga bahan naik.
            </p>
            <div className="absolute -bottom-5 right-6 bg-smart-card border border-smart-lime p-3 rounded-2xl shadow-[0_0_15px_rgba(212,245,66,0.15)] flex items-center justify-center transition-colors">
              <span className="material-icons-round text-smart-lime text-3xl">
                receipt_long
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
