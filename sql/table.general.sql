-- Skema tabel untuk MariaDB/MySQL/PostgreSQL

-- Drop tables jika ada sebelumnya
DROP TABLE IF EXISTS desa;
DROP TABLE IF EXISTS kelurahan;
DROP TABLE IF EXISTS kecamatan;
DROP TABLE IF EXISTS kabupaten;

-- Kabupaten
CREATE TABLE IF NOT EXISTS kabupaten (
    kode_kabupaten CHAR(2) PRIMARY KEY, -- Menggunakan VARCHAR untuk kompatibilitas
    nama_kabupaten VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS kabupaten_nama_idx ON kabupaten (nama_kabupaten);

-- Kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    kode_kabupaten CHAR(2) NOT NULL,
    kode_kecamatan CHAR(2) NOT NULL,
    nama_kecamatan VARCHAR(255) NOT NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan),
    FOREIGN KEY (kode_kabupaten) REFERENCES kabupaten (kode_kabupaten)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS kecamatan_nama_idx ON kecamatan (nama_kecamatan);

-- Kelurahan
CREATE TABLE IF NOT EXISTS kelurahan (
    kode_kabupaten CHAR(2) NOT NULL,
    kode_kecamatan CHAR(2) NOT NULL,
    kode_kelurahan CHAR(2) NOT NULL,
    nama_kelurahan VARCHAR(255) NOT NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan),
    FOREIGN KEY (kode_kabupaten, kode_kecamatan) REFERENCES kecamatan (kode_kabupaten, kode_kecamatan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS kelurahan_nama_idx ON kelurahan (nama_kelurahan);

-- Desa
CREATE TABLE IF NOT EXISTS desa (
    kode_kabupaten CHAR(2) NOT NULL,
    kode_kecamatan CHAR(2) NOT NULL,
    kode_kelurahan CHAR(2) NOT NULL,
    kode_desa CHAR(4) NOT NULL,
    nama_desa VARCHAR(255) NOT NULL,
    kode_pos CHAR(5) NULL,
    PRIMARY KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan, kode_desa, kode_pos),
    FOREIGN KEY (kode_kabupaten, kode_kecamatan, kode_kelurahan) REFERENCES kelurahan (kode_kabupaten, kode_kecamatan, kode_kelurahan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS desa_nama_idx ON desa (nama_desa);
