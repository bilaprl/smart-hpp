-- FILE DATABASE SCHEMA SMARTHPP

-- A. Skema Manajemen Bisnis & Produk
-- 1. Tabel Profil Pengguna (Ekstensi dari tabel auth.users bawaan Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama_owner TEXT,
  nama_bisnis TEXT,
  tipe_bisnis TEXT CHECK (tipe_bisnis IN ('produksi', 'retail', 'jasa')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Produk
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_produk TEXT NOT NULL,
  kategori TEXT,
  yield_qty NUMERIC DEFAULT 1,
  yield_unit TEXT DEFAULT 'Porsi',
  hpp_per_unit NUMERIC DEFAULT 0,
  harga_jual NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Bahan Baku (Grosir/Nota)
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_bahan TEXT NOT NULL,
  harga_beli_total NUMERIC NOT NULL,
  volume_kemasan NUMERIC NOT NULL,
  satuan_dasar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Detail Resep (Menghubungkan Produk & Bahan Baku)
CREATE TABLE recipe_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  jumlah_digunakan NUMERIC NOT NULL
);

-- 5. Tabel Transaksi Penjualan
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  tanggal DATE DEFAULT CURRENT_DATE,
  qty_terjual INTEGER NOT NULL,
  total_pendapatan NUMERIC NOT NULL
);

-- 6. Tabel Alokasi Keuangan (Per Bulan)
CREATE TABLE allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  periode_bulan DATE NOT NULL,
  persen_modal INTEGER DEFAULT 50,
  persen_gaji INTEGER DEFAULT 30,
  persen_tabungan INTEGER DEFAULT 20
);

-- B. TABEL PROFILE
-- 1. Hapus dulu yang lama agar bersih (Hati-hati: Data profil manual akan hilang)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles;

-- 2. Buat ulang tabel profiles dengan kolom yang tepat
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nama_owner TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Aktifkan RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Buat Policy (Izin Akses)
CREATE POLICY "Semua orang bisa lihat profil" ON profiles FOR SELECT USING (true);
CREATE POLICY "User bisa update profil sendiri" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Sistem bisa insert profil" ON profiles FOR INSERT WITH CHECK (true);

-- 5. Buat Fungsi Trigger (Agar saat daftar otomatis buat profil)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_owner)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Pasang Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- C. TABEL RECIPE ITEMS
-- 1. Buat tabel recipe_items
CREATE TABLE recipe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  nama_bahan TEXT NOT NULL,
  biaya_porsi NUMERIC NOT NULL
);

-- 2. Aktifkan RLS
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;

-- 3. Buat aturan akses mandiri (Hanya user yang login yang bisa simpan/lihat)
CREATE POLICY "Akses mandiri recipe_items" ON recipe_items FOR ALL USING (auth.uid() = user_id);


-- D. MODIFIKASI KOLOM PENAMBAHAN PRODUK REFERENSI UNTUK TABEL RECIPE ITEMS
-- Jalankan ini di SQL Editor Supabase
ALTER TABLE recipe_items 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;

-- E. MODIFIKASI ADD COST DAN MEASUREMENT KE TABEL RECIPE ITEMS
ALTER TABLE recipe_items
ADD COLUMN IF NOT EXISTS tipe_biaya text,
ADD COLUMN IF NOT EXISTS harga_beli numeric,
ADD COLUMN IF NOT EXISTS kapasitas numeric,
ADD COLUMN IF NOT EXISTS satuan text,
ADD COLUMN IF NOT EXISTS takaran numeric;

-- F. MODIFIKASI PENAMBAHAN KOLOM TOTAL LABA SAAT INI KE TABEL ALLOCATIONS
ALTER TABLE allocations ADD COLUMN total_laba_saat_ini bigint;

-- G. ATURAN RLS AKSES MANDIRI BERDASRKAN USER_ID
-- Aktifkan RLS di semua tabel
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

-- Buat aturan: Pengguna HANYA BISA mengakses data yang 'user_id'-nya sama dengan ID mereka
CREATE POLICY "Akses mandiri produk" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Akses mandiri transaksi" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Akses mandiri alokasi" ON allocations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Akses mandiri bahan" ON ingredients FOR ALL USING (auth.uid() = user_id);

-- H. PEMBUATAN PROFIL UNTUK PENGGUNA BARU 
-- Buat fungsi untuk menyalin ID pengguna baru ke tabel profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_owner)
  VALUES (new.id, split_part(new.email, '@', 1)); -- Ambil nama dari depan email
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buat trigger agar fungsi di atas berjalan otomatis setiap ada yang mendaftar
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- I. UPDATE PROFIL PRIBADI
-- Kebijakan agar user bisa mengupdate profilnya sendiri
CREATE POLICY "User bisa update profil sendiri" 
ON profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);