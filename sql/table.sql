-- Skema tabel untuk SQLite

-- Aktifkan foreign key constraint (SQLite memerlukan ini secara manual)
PRAGMA foreign_keys = ON;

-- Hapus tabel jika ada sebelumnya
DROP TABLE IF EXISTS desa;
DROP TABLE IF EXISTS kelurahan;
DROP TABLE IF EXISTS kecamatan;
DROP TABLE IF EXISTS kabupaten;

-- Kabupaten
CREATE TABLE IF NOT EXISTS kabupaten (
    kode_kabupaten TEXT PRIMARY KEY, -- SQLite menggunakan TEXT untuk tipe string
    nama_kabupaten TEXT NOT NULL
);

-- Kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    kode_kabupaten TEXT NOT NULL,
    kode_kecamatan TEXT NOT NULL,
    nama_kecamatan TEXT NOT NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan),
    FOREIGN KEY (kode_kabupaten) REFERENCES kabupaten (kode_kabupaten)
);

-- Kelurahan
CREATE TABLE IF NOT EXISTS kelurahan (
    kode_kabupaten TEXT NOT NULL,
    kode_kecamatan TEXT NOT NULL,
    kode_kelurahan TEXT NOT NULL,
    nama_kelurahan TEXT NOT NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan),
    FOREIGN KEY (kode_kabupaten, kode_kecamatan) REFERENCES kecamatan (kode_kabupaten, kode_kecamatan)
);

-- Desa
CREATE TABLE IF NOT EXISTS desa (
    kode_kabupaten TEXT NOT NULL,
    kode_kecamatan TEXT NOT NULL,
    kode_kelurahan TEXT NOT NULL,
    kode_desa TEXT NOT NULL,
    nama_desa TEXT NOT NULL,
    kode_pos TEXT NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan, kode_desa, kode_pos),
    FOREIGN KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan) REFERENCES kelurahan (kode_kabupaten, kode_kecamatan, kode_kelurahan)
);

-- Buat indeks (SQLite tidak mendukung "IF NOT EXISTS" untuk indeks sebelum versi 3.26.0)
CREATE INDEX kabupaten_nama_idx ON kabupaten (nama_kabupaten);
CREATE INDEX kecamatan_nama_idx ON kecamatan (nama_kecamatan);
CREATE INDEX kelurahan_nama_idx ON kelurahan (nama_kelurahan);
CREATE INDEX desa_nama_idx ON desa (nama_desa);
