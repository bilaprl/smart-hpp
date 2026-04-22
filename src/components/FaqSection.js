import { useState } from 'react';

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Apa itu SmartHPP?",
      a: "SmartHPP adalah platform manajemen keuangan cerdas yang dirancang khusus untuk UMKM. Sistem ini membantu Anda menghitung Harga Pokok Penjualan (HPP) secara presisi, memantau laba-rugi, dan mengalokasikan pendapatan secara otomatis tanpa perlu keahlian akuntansi khusus."
    },
    {
      q: "Bisakah aplikasi ini digunakan untuk usaha selain kuliner (F&B)?",
      a: "Tentu saja! SmartHPP sangat fleksibel dan memiliki 3 mode perhitungan HPP: Mode Produksi (untuk F&B atau kriya/kerajinan), Mode Retail (untuk jual-beli barang jadi tanpa proses masak/rakit), dan Mode Jasa (layanan profesional yang menggunakan material pendukung)."
    },
    {
      q: "Apakah data finansial saya aman?",
      a: "Keamanan privasi Anda adalah prioritas kami. Seluruh data transaksi, resep, dan laporan laba-rugi disimpan dengan enkripsi standar industri. Kami tidak akan pernah membagikan data internal bisnis Anda kepada pihak ketiga."
    },
    {
      q: "Bagaimana cara kerja fitur Manajer Alokasi Laba?",
      a: "Setelah Anda mencatat penjualan dan sistem menghitung Laba Bersih, Manajer Alokasi akan memecah nominal tersebut ke dalam beberapa 'pos dompet' berdasarkan persentase yang Anda atur sebelumnya (misalnya: 50% untuk diputar kembali jadi Modal, 30% untuk Gaji Pemilik, dan 20% untuk Dana Darurat)."
    },
    {
      q: "Apakah saya harus membayar untuk menggunakan fitur ini?",
      a: "Anda dapat mencoba Kalkulator HPP dalam mode simulasi secara gratis selamanya. Namun, untuk menyimpan data resep secara permanen dan melihat riwayat insight di Dasbor secara real-time, Anda diwajibkan untuk mendaftar akun dan masuk (login)."
    }
  ];

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto pb-20 pt-10 px-4">
      
      {/* Header FAQ */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-smart-lime/10 border border-smart-lime/20 text-smart-lime mb-6 shadow-[0_0_20px_rgba(212,245,66,0.15)]">
          <span className="material-icons-round text-4xl">live_help</span>
        </div>
        <h1 className="font-montserrat font-extrabold text-3xl md:text-5xl text-smart-text mb-4 transition-colors duration-300">
          Pusat Bantuan & FAQ
        </h1>
        <p className="text-smart-text-muted text-lg max-w-2xl mx-auto transition-colors duration-300">
          Jawaban untuk pertanyaan yang paling sering diajukan seputar penggunaan sistem akuntansi cerdas kami.
        </p>
      </div>

      {/* Accordion FAQ */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isActive = activeIndex === index;
          return (
            <div 
              key={index} 
              className={`bg-smart-card border ${isActive ? 'border-smart-lime shadow-[0_4px_20px_rgba(212,245,66,0.1)]' : 'border-smart-border'} rounded-[1.5rem] overflow-hidden transition-all duration-300`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 md:px-8 py-6 text-left flex justify-between items-center group focus:outline-none"
              >
                <h3 className={`font-montserrat font-bold text-lg pr-8 transition-colors duration-300 ${isActive ? 'text-smart-lime' : 'text-smart-text group-hover:text-smart-lime'}`}>
                  {faq.q}
                </h3>
                <span className={`material-icons-round text-smart-text-muted transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-180 text-smart-lime' : ''}`}>
                  expand_more
                </span>
              </button>
              
              <div 
                className={`px-6 md:px-8 overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="h-px w-full bg-smart-border/50 mb-6"></div>
                <p className="text-smart-text-muted text-base leading-relaxed transition-colors duration-300">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kontak Support Bawah */}
      <div className="mt-16 bg-smart-bg border border-smart-border rounded-[2rem] p-8 text-center transition-colors duration-300">
        <h4 className="font-bold text-smart-text mb-2 transition-colors">Masih butuh bantuan spesifik?</h4>
        <p className="text-smart-text-muted text-sm mb-6 transition-colors">Tim dukungan kami siap membantu Anda menyelesaikan kendala teknis.</p>
        <button className="bg-transparent border border-smart-text-muted text-smart-text font-bold px-8 py-3 rounded-full hover:border-smart-lime hover:text-smart-lime transition-all text-sm">
          Hubungi Kami via Email
        </button>
      </div>

    </div>
  );
}