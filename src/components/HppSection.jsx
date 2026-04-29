import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

const TableGroup = ({
  type,
  title,
  desc,
  colName,
  rows,
  units,
  labels,
  updateRow,
  removeRow,
  getRowCost,
  formatRp,
  addRow,
}) => {
  const iconColor =
    type === "main"
      ? "text-smart-lime"
      : type === "labor"
        ? "text-blue-500"
        : "text-purple-500";
  const iconName =
    type === "main"
      ? "inventory_2"
      : type === "labor"
        ? "engineering"
        : "receipt_long";

  return (
    <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
      <div className="mb-6 border-b border-smart-border pb-4">
        <h3 className="font-montserrat font-bold text-lg text-smart-text flex items-center gap-2">
          <span className={`material-icons-round ${iconColor}`}>
            {iconName}
          </span>
          {title}
        </h3>
        <p className="text-smart-text-muted text-sm mt-1 ml-8">{desc}</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead>
            <tr className="text-smart-text-muted border-b border-smart-border/80 text-[11px] uppercase tracking-wider">
              <th className="pb-4 font-semibold w-[22%]">{colName}</th>
              <th className="pb-4 font-semibold w-[18%]">{labels.price}</th>
              <th className="pb-4 font-semibold w-[15%]">{labels.vol}</th>
              <th className="pb-4 font-semibold w-[12%]">{labels.unit}</th>
              <th className="pb-4 font-semibold w-[15%] text-smart-lime">
                {labels.qty}
              </th>
              <th className="pb-4 font-semibold w-[15%]">Biaya HPP</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-smart-border/50">
            {rows.map((row) => {
              const unitPrice =
                (Number(row.totalPrice) || 0) /
                (Number(row.totalVolume) > 0 ? Number(row.totalVolume) : 1);
              return (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-smart-border/30"
                >
                  <td className="py-4 pr-2">
                    <input
                      type="text"
                      placeholder="Ketik nama item..."
                      value={row.name}
                      onChange={(e) =>
                        updateRow(type, row.id, "name", e.target.value)
                      }
                      className="w-full bg-smart-bg border border-smart-border rounded-lg px-3 py-2.5 text-sm text-smart-text focus:border-smart-lime outline-none transition-all"
                    />
                  </td>
                  <td className="py-4 pr-2 relative">
                    <span className="absolute left-3 top-6 text-smart-text-muted text-xs font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={row.totalPrice}
                      onChange={(e) =>
                        updateRow(type, row.id, "totalPrice", e.target.value)
                      }
                      className="w-full bg-smart-bg border border-smart-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-smart-text focus:border-smart-lime outline-none transition-all"
                    />
                  </td>
                  <td className="py-4 pr-2 relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Total"
                      value={row.totalVolume}
                      onChange={(e) =>
                        updateRow(type, row.id, "totalVolume", e.target.value)
                      }
                      className="w-full bg-smart-bg border border-smart-border rounded-lg px-3 py-2.5 text-sm text-smart-text focus:border-smart-lime outline-none transition-all pr-8"
                    />
                  </td>
                  <td className="py-4 pr-2">
                    <div className="relative">
                      <select
                        value={row.unit}
                        onChange={(e) =>
                          updateRow(type, row.id, "unit", e.target.value)
                        }
                        className="w-full bg-smart-bg border border-smart-border rounded-lg px-3 py-2.5 text-sm text-smart-text focus:border-smart-lime outline-none transition-all appearance-none cursor-pointer"
                      >
                        {units.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      <span className="material-icons-round absolute right-1 top-2.5 text-smart-text-muted pointer-events-none text-lg">
                        arrow_drop_down
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-2 relative">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={row.recipeQty}
                      onChange={(e) =>
                        updateRow(type, row.id, "recipeQty", e.target.value)
                      }
                      className="w-full bg-smart-lime/10 border border-smart-lime/50 rounded-lg px-3 py-2.5 text-sm text-smart-lime font-bold focus:border-smart-lime outline-none transition-all placeholder-smart-lime/30 pr-8"
                    />
                    <span className="absolute right-4 top-6 text-smart-lime/60 text-[10px] font-bold uppercase pointer-events-none">
                      {row.unit}
                    </span>
                  </td>
                  <td className="py-4 pr-2">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-smart-text">
                        {formatRp(getRowCost(row))}
                      </span>
                      <span className="text-[10px] text-smart-text-muted font-medium">
                        @ {formatRp(unitPrice)} / {row.unit}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => removeRow(type, row.id)}
                      className="text-smart-text-muted hover:text-red-500 p-2 rounded-lg transition-colors"
                      title="Hapus Baris"
                    >
                      <span className="material-icons-round text-lg">
                        delete_outline
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => addRow(type)}
        className="mt-2 bg-smart-bg border border-dashed border-smart-text-muted text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:border-smart-lime hover:text-smart-lime text-smart-text transition-colors w-full sm:w-auto justify-center"
      >
        <span className="material-icons-round text-sm">add</span> Tambah Baris
      </button>
    </div>
  );
};

// =========================================================================
// KOMPONEN UTAMA
// =========================================================================
export default function HppSection({ isLoggedIn = false, openModal }) {
  const [businessType, setBusinessType] = useState("produksi");
  const [yieldQty, setYieldQty] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("Pcs");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const [existingProducts, setExistingProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("new");

  const typeConfig = {
    produksi: {
      inputPlaceholder: "Cth: Kopi Susu (1 Panci) / Tote Bag (1 Batch)",
      mainTitle: "1. Bahan Baku Langsung (Direct Material)",
      laborTitle: "2. Tenaga Kerja Langsung (Direct Labor)",
      otherTitle: "3. Biaya Overhead & Kemasan",
      mainDesc: "Komponen fisik produk (Tepung, Daging, Kain, Kayu).",
      laborDesc: "Gaji pekerja/perajin yang mengerjakan batch/resep ini.",
      otherDesc: "Biaya utilitas (Gas, Listrik) dan Kemasan (Box, Plastik).",
      mainCol: "Nama Bahan Baku",
      laborCol: "Peran Pekerja",
      otherCol: "Nama Biaya Overhead",
      mainUnits: ["gr", "ml", "pcs", "meter"],
      laborUnits: ["jam", "menit", "hari", "orang"],
      otherUnits: ["pcs", "pack", "ml", "kwh"],
      mainLabels: {
        price: "Harga Beli (Nota)",
        vol: "Isi Kemasan Total",
        unit: "Satuan Dasar",
        qty: "Takaran / Porsi Pakai",
      },
      laborLabels: {
        price: "Total Upah / Gaji",
        vol: "Kapasitas Waktu",
        unit: "Satuan Waktu",
        qty: "Lama Pengerjaan",
      },
      otherLabels: {
        price: "Total Biaya (Nota)",
        vol: "Estimasi Batas Pakai",
        unit: "Satuan",
        qty: "Pemakaian 1 Batch",
      },
    },
    retail: {
      inputPlaceholder: "Cth: Sepatu Sneakers Polos",
      mainTitle: "1. Harga Beli Barang Dagang",
      laborTitle: "2. Tenaga Kerja",
      otherTitle: "3. Biaya Logistik & Pengemasan",
      mainDesc: "Harga beli produk utuh dari supplier / agen grosir.",
      laborDesc: "Upah pegawai yang mengepak atau melayani pesanan ini.",
      otherDesc:
        "Biaya ekspedisi, ongkos kirim, dan material keamanan (Bubble Wrap).",
      mainCol: "Nama Barang Grosir",
      laborCol: "Peran Pekerja",
      otherCol: "Nama Biaya Logistik",
      mainUnits: ["pcs", "unit", "pasang"],
      laborUnits: ["jam", "hari", "orang"],
      otherUnits: ["resi", "pcs", "meter"],
      mainLabels: {
        price: "Harga Beli Grosir",
        vol: "Isi per Grosir",
        unit: "Satuan Eceran",
        qty: "Dijual per Paket",
      },
      laborLabels: {
        price: "Gaji Pokok Pekerja",
        vol: "Target Kuantitas",
        unit: "Satuan Waktu",
        qty: "Waktu Mengemas",
      },
      otherLabels: {
        price: "Total Biaya (Resi)",
        vol: "Kapasitas Bagi Rata",
        unit: "Satuan",
        qty: "Beban per Unit",
      },
    },
    jasa: {
      inputPlaceholder: "Cth: Jasa Servis AC / Pijat Refleksi",
      mainTitle: "1. Material Utama & Suku Cadang",
      laborTitle: "2. Upah Tenaga Kerja Profesional",
      otherTitle: "3. Biaya Transportasi & Overhead",
      mainDesc:
        "Barang yang dihabiskan untuk layanan (Krim Pijat, Freon AC, Sparepart).",
      laborDesc: "Gaji utama teknisi atau penyedia jasa layanan ini.",
      otherDesc: "Biaya bensin, parkir, penyusutan alat, dan konsumsi.",
      mainCol: "Nama Material",
      laborCol: "Nama / Peran Teknisi",
      otherCol: "Nama Biaya Overhead",
      mainUnits: ["ml", "gr", "pcs"],
      laborUnits: ["menit", "jam", "sesi"],
      otherUnits: ["liter", "km", "kali"],
      mainLabels: {
        price: "Harga Beli Material",
        vol: "Isi Kemasan Total",
        unit: "Satuan Dasar",
        qty: "Dipakai 1 Sesi",
      },
      laborLabels: {
        price: "Tarif Pokok / Gaji",
        vol: "Kapasitas Waktu",
        unit: "Satuan Waktu",
        qty: "Durasi 1 Sesi",
      },
      otherLabels: {
        price: "Total Pengeluaran",
        vol: "Batas Pemakaian",
        unit: "Satuan",
        qty: "Beban per Sesi",
      },
    },
  };

  const currentConf = typeConfig[businessType];

  const createResetRow = (unitsArray) => [
    {
      id: Date.now() + Math.random(),
      name: "",
      totalPrice: "",
      totalVolume: "",
      unit: unitsArray[0],
      recipeQty: "",
    },
  ];

  const [mainRows, setMainRows] = useState(
    createResetRow(currentConf.mainUnits),
  );
  const [laborRows, setLaborRows] = useState(
    createResetRow(currentConf.laborUnits),
  );
  const [otherRows, setOtherRows] = useState(
    createResetRow(currentConf.otherUnits),
  );

  useEffect(() => {
    const fetchExisting = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;
      const { data } = await supabase
        .from("products")
        .select("id, nama_produk")
        .eq("user_id", user.id)
        .eq("kategori", businessType);
      if (data) setExistingProducts(data);
    };
    if (isLoggedIn) fetchExisting();
  }, [isLoggedIn, businessType]);

  const handleProductSelect = async (id) => {
    setSelectedProductId(id);

    if (id === "new") {
      setProductName("");
      setSellingPrice("");
      setYieldQty(1);
      setMainRows(createResetRow(currentConf.mainUnits));
      setLaborRows(createResetRow(currentConf.laborUnits));
      setOtherRows(createResetRow(currentConf.otherUnits));
      return;
    }

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (product) {
      setProductName(product.nama_produk);
      setSellingPrice(product.harga_jual);
      setYieldQty(product.yield_qty);
      setYieldUnit(product.yield_unit);

      const { data: ing } = await supabase
        .from("recipe_items")
        .select("*")
        .eq("product_id", id);

      if (ing && ing.length > 0) {
        const mapRow = (i) => ({
          id: i.id,
          name: i.nama_bahan,
          totalPrice: i.harga_beli ?? i.biaya_porsi ?? "",
          totalVolume: i.kapasitas ?? "1",
          unit: i.satuan || "pcs",
          recipeQty: i.takaran ?? "1",
        });

        // Filter memisahkan sesuai tipe, jika data lama tidak ada tipe_biaya, diselamatkan ke main
        const mains = ing
          .filter((i) => i.tipe_biaya === "main" || !i.tipe_biaya)
          .map(mapRow);
        const labors = ing.filter((i) => i.tipe_biaya === "labor").map(mapRow);
        const others = ing.filter((i) => i.tipe_biaya === "other").map(mapRow);

        setMainRows(
          mains.length > 0 ? mains : createResetRow(currentConf.mainUnits),
        );
        setLaborRows(
          labors.length > 0 ? labors : createResetRow(currentConf.laborUnits),
        );
        setOtherRows(
          others.length > 0 ? others : createResetRow(currentConf.otherUnits),
        );
      } else {
        setMainRows(createResetRow(currentConf.mainUnits));
        setLaborRows(createResetRow(currentConf.laborUnits));
        setOtherRows(createResetRow(currentConf.otherUnits));
      }
    }
  };

  const formatRp = (num) =>
    "Rp " +
    (Number(num) || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

  const addRow = (type) => {
    const id = Date.now() + Math.random();
    const row = {
      id,
      name: "",
      totalPrice: "",
      totalVolume: "",
      unit: currentConf[`${type}Units`][0],
      recipeQty: "",
    };
    if (type === "main") setMainRows([...mainRows, row]);
    else if (type === "labor") setLaborRows([...laborRows, row]);
    else setOtherRows([...otherRows, row]);
  };

  const removeRow = (type, id) => {
    if (type === "main") setMainRows(mainRows.filter((row) => row.id !== id));
    else if (type === "labor")
      setLaborRows(laborRows.filter((row) => row.id !== id));
    else setOtherRows(otherRows.filter((row) => row.id !== id));
  };

  const updateRow = (type, id, field, value) => {
    const updater = (prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row));
    if (type === "main") setMainRows(updater);
    else if (type === "labor") setLaborRows(updater);
    else setOtherRows(updater);
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setBusinessType(val);
    const conf = typeConfig[val];
    setSelectedProductId("new");

    setMainRows(createResetRow(conf.mainUnits));
    setLaborRows(createResetRow(conf.laborUnits));
    setOtherRows(createResetRow(conf.otherUnits));

    setProductName("");
    setSellingPrice("");
    setYieldQty(1);
    setYieldUnit(
      val === "produksi" ? "Pcs" : val === "retail" ? "Pcs" : "Sesi",
    );
  };

  const getRowCost = (row) => {
    const price = Number(row.totalPrice) || 0;
    const volume = Number(row.totalVolume) > 0 ? Number(row.totalVolume) : 1;
    const recipeQty = Number(row.recipeQty) || 0;
    return (price / volume) * recipeQty;
  };

  const sumMain = mainRows.reduce((sum, row) => sum + getRowCost(row), 0);
  const sumLabor = laborRows.reduce((sum, row) => sum + getRowCost(row), 0);
  const sumOther = otherRows.reduce((sum, row) => sum + getRowCost(row), 0);

  const grandTotalBatch = sumMain + sumLabor + sumOther;
  const activeYieldQty =
    businessType === "produksi"
      ? Number(yieldQty) > 0
        ? Number(yieldQty)
        : 1
      : 1;
  const totalHppPerUnit = grandTotalBatch / activeYieldQty;

  const margin30 = totalHppPerUnit * 1.3;
  const margin40 = totalHppPerUnit * 1.4;
  const labaBersih = Number(sellingPrice) - totalHppPerUnit;

  const handleSave = async () => {
    if (!isLoggedIn) return openModal("auth");

    if (!productName || productName.trim() === "") {
      alert("⚠️ Ops, Nama Produk/Layanan belum diisi!");
      return;
    }
    if (totalHppPerUnit <= 0) {
      alert(
        "⚠️ Total HPP masih Rp 0! Tolong isi minimal satu item biaya pada tabel di atas.",
      );
      return;
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      alert("⚠️ Harga Jual tidak boleh Rp 0! Masukkan harga jual yang wajar.");
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = session?.user;
      if (!user)
        throw new Error("Sesi login tidak valid. Silakan muat ulang halaman.");

      const payload = {
        user_id: user.id,
        nama_produk: productName,
        kategori: businessType,
        yield_qty: yieldQty,
        yield_unit: yieldUnit,
        hpp_per_unit: totalHppPerUnit,
        harga_jual: Number(sellingPrice),
      };

      let pid;
      if (selectedProductId !== "new") {
        const { error: errUpdate } = await supabase
          .from("products")
          .update(payload)
          .eq("id", selectedProductId);
        if (errUpdate) throw errUpdate;

        pid = selectedProductId;

        const { error: errDel } = await supabase
          .from("recipe_items")
          .delete()
          .eq("product_id", pid);
        if (errDel) throw errDel;
      } else {
        const { data, error: errInsert } = await supabase
          .from("products")
          .insert([payload])
          .select();
        if (errInsert) throw errInsert;
        pid = data[0].id;
      }

      const filterValidRows = (rows, tipe) =>
        rows
          .filter((r) => r.name.trim() !== "")
          .map((r) => ({ ...r, tipe_biaya: tipe }));

      const allIngredients = [
        ...filterValidRows(mainRows, "main"),
        ...filterValidRows(laborRows, "labor"),
        ...filterValidRows(otherRows, "other"),
      ];

      const ingredientsToSave = allIngredients.map((row) => ({
        user_id: user.id,
        product_id: pid,
        nama_bahan: row.name,
        biaya_porsi: getRowCost(row),
        tipe_biaya: row.tipe_biaya,
        harga_beli: Number(row.totalPrice) || 0,
        kapasitas: Number(row.totalVolume) || 1,
        satuan: row.unit,
        takaran: Number(row.recipeQty) || 0,
      }));

      // SIMPAN KE SUPABASE DAN TANGKAP ERROR JIKA GAGAL!
      const { error: errFinal } = await supabase
        .from("recipe_items")
        .insert(ingredientsToSave);
      if (errFinal) throw errFinal;

      alert("HPP Berhasil Disimpan & Sinkron dengan Database! 🚀");
      window.location.reload();
    } catch (err) {
      console.error("SUPABASE ERROR DETAILS:", err);
      // Tampilkan error aslinya agar ketahuan apa yang salah di database
      const pesanError =
        err.message || err.details || err.hint || JSON.stringify(err);
      alert(
        `⚠️ GAGAL MENYIMPAN DATA!\n\nAlasan: ${pesanError}\n\nPastikan kamu SUDAH MENAMBAHKAN 5 KOLOM BARU di Supabase!`,
      );
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h2 className="font-montserrat font-bold text-3xl md:text-4xl text-smart-text mb-2 transition-colors duration-300">
            Kalkulator HPP Cerdas
          </h2>
          <p className="text-smart-text-muted text-sm md:text-base">
            Dilengkapi 3 Komponen Akuntansi Pabrik & Logika Produksi.
          </p>
        </div>

        <div className="bg-smart-card border border-smart-border rounded-2xl px-5 py-3 flex items-center shadow-lg hover:border-smart-text-muted transition-colors duration-300">
          <span className="text-sm text-smart-text-muted mr-3 font-medium">
            Tipe Bisnis:
          </span>
          <select
            value={businessType}
            onChange={handleTypeChange}
            className="bg-transparent text-sm font-bold text-smart-text focus:outline-none cursor-pointer appearance-none pr-4 transition-colors"
          >
            <option value="produksi" className="bg-smart-bg">
              Produksi (F&B / Kriya)
            </option>
            <option value="retail" className="bg-smart-bg">
              Retail - Beli Jual
            </option>
            <option value="jasa" className="bg-smart-bg">
              Jasa & Pelayanan
            </option>
          </select>
          <span className="material-icons-round text-smart-text-muted pointer-events-none text-sm">
            expand_more
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-smart-card to-smart-bg border border-smart-lime/40 p-6 md:p-8 rounded-[2rem] shadow-2xl mb-8 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-smart-lime/5 rounded-bl-full pointer-events-none"></div>
        <h3 className="font-montserrat font-bold text-xl text-smart-lime mb-4 flex items-center gap-2">
          <span className="material-icons-round">lightbulb</span> Panduan
          Pengisian Otomatis
        </h3>
        <p className="text-smart-text text-sm leading-relaxed mb-6 opacity-90">
          <strong>Rahasia SmartHPP:</strong> Anda tidak perlu menghitung harga
          satuan memakai kalkulator! Cukup masukkan{" "}
          <span className="font-bold underline decoration-smart-lime underline-offset-4">
            Harga Total sesuai di Nota Belanja
          </span>
          . Sistem kami yang akan memecahnya secara otomatis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-smart-border/30 p-4 rounded-xl border border-smart-border">
            <h4 className="font-bold text-smart-text text-sm mb-2">
              {currentConf.mainTitle}
            </h4>
            <ul className="text-xs text-smart-text-muted space-y-2 list-disc pl-4">
              <li>
                <strong>{currentConf.mainLabels.price}:</strong> Uang yang Anda
                bayarkan ke kasir.
              </li>
              <li>
                <strong>{currentConf.mainLabels.vol}:</strong> Kapasitas barang
                yang didapat (Cth: Beli 1 Kg, isi "1000").
              </li>
              <li>
                <strong>{currentConf.mainLabels.qty}:</strong> Berapa yang
                dipakai untuk resep/pesanan ini saja. <br />
                <span className="text-smart-lime italic">
                  (Bisa ketik desimal/koma misal 1.5)
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-smart-border/30 p-4 rounded-xl border border-smart-border">
            <h4 className="font-bold text-smart-text text-sm mb-2">
              {currentConf.laborTitle}
            </h4>
            <ul className="text-xs text-smart-text-muted space-y-2 list-disc pl-4">
              <li>
                <strong>{currentConf.laborLabels.price}:</strong> Gaji pekerja
                secara utuh (Harian/Bulanan).
              </li>
              <li>
                <strong>{currentConf.laborLabels.vol}:</strong> Total jam/hari
                kerjanya dalam sebulan.
              </li>
              <li>
                <strong>{currentConf.laborLabels.qty}:</strong> Durasi yang
                dihabiskan untuk melayani 1 order ini.
              </li>
            </ul>
          </div>
          <div className="bg-smart-border/30 p-4 rounded-xl border border-smart-border">
            <h4 className="font-bold text-smart-text text-sm mb-2">
              {currentConf.otherTitle}
            </h4>
            <ul className="text-xs text-smart-text-muted space-y-2 list-disc pl-4">
              <li>
                <strong>{currentConf.otherLabels.price}:</strong> Total tagihan
                (Cth: Beli Listrik Rp 20.000).
              </li>
              <li>
                <strong>{currentConf.otherLabels.vol}:</strong> Kuota itu
                kira-kira habis untuk berapa Pcs/Porsi?
              </li>
              <li>
                <strong>{currentConf.otherLabels.qty}:</strong> Ketik 1, agar
                beban dibagi rata ke tiap Pcs/Porsi.
              </li>
            </ul>
          </div>
        </div>
        {businessType === "produksi" && (
          <div className="mt-6 bg-smart-lime/10 p-4 rounded-xl border border-smart-lime/20 text-sm">
            <strong className="text-smart-lime">
              💡 Tips "Jumlah Produk Dihasilkan":
            </strong>{" "}
            Karena Anda di mode Produksi, wajar jika tabel diisi dengan modal
            besar (1 batch/resep besar). Nanti, masukkan "Jumlah Produk" di
            panel sebelah kanan agar sistem membaginya menjadi Harga Per
            Pcs/Porsi.
          </div>
        )}
      </div>

      {!isLoggedIn && (
        <div className="bg-smart-lime/10 border border-smart-lime/30 text-smart-lime px-6 py-4 rounded-2xl mb-8 flex items-start md:items-center gap-4 text-sm md:text-base font-medium">
          <span className="material-icons-round text-2xl">info</span>
          <p className="leading-relaxed">
            Mode Simulasi. Anda bisa menghitung HPP secara bebas, namun data
            tidak akan tersimpan permanen sebelum{" "}
            <button
              onClick={() => openModal && openModal("auth")}
              className="underline font-bold hover:opacity-80 transition-opacity"
            >
              membuat akun
            </button>
            .
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-smart-text-muted mb-2 uppercase tracking-wider">
                  Edit Produk Eksis
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-smart-bg border border-smart-border rounded-xl px-4 py-4 text-sm font-bold text-smart-text focus:border-smart-lime outline-none"
                >
                  <option value="new">-- Tambah Produk Baru --</option>
                  {existingProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_produk}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-smart-text-muted mb-2 uppercase tracking-wider">
                  Nama Resep / Layanan
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={currentConf.inputPlaceholder}
                  className="w-full bg-smart-bg border border-smart-border rounded-xl px-5 py-4 text-sm font-bold focus:border-smart-lime text-smart-text transition-all"
                />
              </div>
            </div>
          </div>

          <TableGroup
            type="main"
            title={currentConf.mainTitle}
            desc={currentConf.mainDesc}
            colName={currentConf.mainCol}
            rows={mainRows}
            units={currentConf.mainUnits}
            labels={currentConf.mainLabels}
            updateRow={updateRow}
            removeRow={removeRow}
            getRowCost={getRowCost}
            formatRp={formatRp}
            addRow={addRow}
          />
          <TableGroup
            type="labor"
            title={currentConf.laborTitle}
            desc={currentConf.laborDesc}
            colName={currentConf.laborCol}
            rows={laborRows}
            units={currentConf.laborUnits}
            labels={currentConf.laborLabels}
            updateRow={updateRow}
            removeRow={removeRow}
            getRowCost={getRowCost}
            formatRp={formatRp}
            addRow={addRow}
          />
          <TableGroup
            type="other"
            title={currentConf.otherTitle}
            desc={currentConf.otherDesc}
            colName={currentConf.otherCol}
            rows={otherRows}
            units={currentConf.otherUnits}
            labels={currentConf.otherLabels}
            updateRow={updateRow}
            removeRow={removeRow}
            getRowCost={getRowCost}
            formatRp={formatRp}
            addRow={addRow}
          />
        </div>

        <div className="bg-smart-card border border-smart-border p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col h-fit sticky top-8 transition-colors duration-300">
          {businessType === "produksi" && (
            <div className="mb-6 pb-6 border-b border-smart-border">
              <h3 className="text-smart-text-muted text-xs font-semibold mb-2 uppercase tracking-widest">
                Total Modal Keseluruhan
              </h3>
              <p className="text-smart-text font-black text-2xl mb-5">
                {formatRp(grandTotalBatch)}
              </p>
              <label className="block text-sm font-bold text-smart-lime mb-3 tracking-wide flex items-center justify-between">
                Jumlah Produk yang Dihasilkan
                <span
                  className="material-icons-round text-smart-lime text-sm cursor-help"
                  title="Masukkan berapa banyak produk yang jadi dari resep di atas"
                >
                  info
                </span>
              </label>
              <div className="flex gap-2 animate-fade-in">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={yieldQty}
                  onChange={(e) => setYieldQty(e.target.value)}
                  className="w-2/3 bg-smart-lime/10 border border-smart-lime/50 rounded-xl px-4 py-3 text-lg font-bold text-smart-lime focus:outline-none transition-all"
                />
                <input
                  type="text"
                  value={yieldUnit}
                  onChange={(e) => setYieldUnit(e.target.value)}
                  className="w-1/3 bg-smart-bg border border-smart-border rounded-xl px-3 py-3 text-sm font-bold text-smart-text focus:outline-none text-center"
                />
              </div>
            </div>
          )}

          <h3 className="text-smart-text-muted text-xs font-semibold mb-1 uppercase tracking-widest">
            Modal HPP per {yieldUnit}
          </h3>
          <h2 className="font-montserrat font-extrabold text-4xl md:text-5xl text-smart-text mb-8">
            {formatRp(totalHppPerUnit)}
          </h2>

          <div className="mb-8">
            <h4 className="font-montserrat font-bold text-sm mb-4 text-smart-text">
              Rekomendasi Harga Jual (Markup)
            </h4>
            <div className="space-y-3">
              <div className="bg-smart-bg border border-smart-border rounded-xl p-4 flex justify-between items-center group hover:border-blue-400/50 transition-colors">
                <span className="font-bold text-sm text-smart-text">
                  {formatRp(margin30)}
                </span>
                <span className="text-xs text-smart-text-muted">
                  (Untung 30%)
                </span>
              </div>
              <div className="bg-smart-bg border border-smart-lime/40 rounded-xl p-4 flex justify-between items-center group hover:border-smart-lime transition-colors">
                <span className="font-bold text-sm text-smart-lime">
                  {formatRp(margin40)}
                </span>
                <span className="text-xs font-bold text-smart-lime/80">
                  ⭐ (Ideal 40%)
                </span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-montserrat font-bold text-sm mb-3 text-smart-text">
              Keputusan Harga Jual Anda
            </h4>
            <div className="relative">
              <span className="absolute left-4 top-4 text-smart-text-muted font-bold">
                Rp
              </span>
              <input
                type="number"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-smart-bg border border-smart-border rounded-xl pl-12 pr-4 py-4 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-smart-lime focus:border-smart-lime text-smart-text mb-2 transition-all"
              />
            </div>
          </div>

          <div className="mb-8 border-t border-smart-border pt-6">
            <h4 className="text-sm font-semibold text-smart-text-muted mb-2">
              Laba Bersih per {yieldUnit}:
            </h4>
            <h3
              className={`font-montserrat font-bold text-2xl md:text-3xl tracking-tight ${sellingPrice === "" ? "text-smart-text-muted" : labaBersih >= 0 ? "text-smart-lime" : "text-red-500"}`}
            >
              {formatRp(labaBersih)}
            </h3>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-smart-lime text-smart-dark font-extrabold py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_4px_20px_rgba(212,245,66,0.3)] mt-auto text-base flex justify-center items-center gap-2"
          >
            <span className="material-icons-round">cloud_done</span>{" "}
            {selectedProductId === "new" ? "Simpan Produk" : "Perbarui Produk"}
          </button>
        </div>
      </div>
    </div>
  );
}
