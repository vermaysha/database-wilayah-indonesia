-- Skema tabel untuk SQLite

-- Aktifkan foreign key constraint (SQLite memerlukan ini secara manual)
PRAGMA foreign_keys = ON;

-- Hapus tabel jika ada sebelumnya
DROP TABLE IF EXISTS kelurahan;

DROP TABLE IF EXISTS kecamatan;

DROP TABLE IF EXISTS kabupaten;

DROP TABLE IF EXISTS provinsi;

-- provinsi
CREATE TABLE IF NOT EXISTS provinsi (
    kode_provinsi TEXT PRIMARY KEY, -- SQLite menggunakan TEXT untuk tipe string
    nama_provinsi TEXT NOT NULL
);

-- kabupaten
CREATE TABLE IF NOT EXISTS kabupaten (
    kode_provinsi TEXT NOT NULL,
    kode_kabupaten TEXT NOT NULL,
    nama_kabupaten TEXT NOT NULL,
    PRIMARY KEY (kode_provinsi, kode_kabupaten),
    FOREIGN KEY (kode_provinsi) REFERENCES provinsi (kode_provinsi)
);

-- kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    kode_provinsi TEXT NOT NULL,
    kode_kabupaten TEXT NOT NULL,
    kode_kecamatan TEXT NOT NULL,
    nama_kecamatan TEXT NOT NULL,
    PRIMARY KEY (
        kode_provinsi,
        kode_kabupaten,
        kode_kecamatan
    ),
    FOREIGN KEY (kode_provinsi, kode_kabupaten) REFERENCES kabupaten (kode_provinsi, kode_kabupaten)
);

-- kelurahan
CREATE TABLE IF NOT EXISTS kelurahan (
    kode_provinsi TEXT NOT NULL,
    kode_kabupaten TEXT NOT NULL,
    kode_kecamatan TEXT NOT NULL,
    kode_kelurahan TEXT NOT NULL,
    nama_kelurahan TEXT NOT NULL,
    kode_pos TEXT NULL,
    PRIMARY KEY (
        kode_provinsi,
        kode_kabupaten,
        kode_kecamatan,
        kode_kelurahan,
        kode_pos
    ),
    FOREIGN KEY (
        kode_provinsi,
        kode_kabupaten,
        kode_kecamatan
    ) REFERENCES kecamatan (
        kode_provinsi,
        kode_kabupaten,
        kode_kecamatan
    )
);

-- Buat indeks (SQLite tidak mendukung "IF NOT EXISTS" untuk indeks sebelum versi 3.26.0)
CREATE INDEX provinsi_nama_idx ON provinsi (nama_provinsi);

CREATE INDEX kabupaten_nama_idx ON kabupaten (nama_kabupaten);

CREATE INDEX kecamatan_nama_idx ON kecamatan (nama_kecamatan);

CREATE INDEX kelurahan_nama_idx ON kelurahan (nama_kelurahan);
