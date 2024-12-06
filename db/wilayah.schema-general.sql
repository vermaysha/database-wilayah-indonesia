-- Skema tabel untuk MariaDB/MySQL/PostgreSQL

-- Drop tables jika ada sebelumnya
DROP TABLE IF EXISTS kelurahan;
DROP TABLE IF EXISTS kecamatan;
DROP TABLE IF EXISTS kabupaten;
DROP TABLE IF EXISTS provinsi;

-- provinsi
CREATE TABLE IF NOT EXISTS provinsi (
    kode_provinsi CHAR(2) PRIMARY KEY, -- Menggunakan VARCHAR untuk kompatibilitas
    nama_provinsi VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS provinsi_nama_idx ON provinsi (nama_provinsi);

-- kabupaten
CREATE TABLE IF NOT EXISTS kabupaten (
    kode_provinsi CHAR(2) NOT NULL,
    kode_kabupaten CHAR(2) NOT NULL,
    nama_kabupaten VARCHAR(255) NOT NULL,
    PRIMARY KEY (kode_provinsi, kode_kabupaten),
    FOREIGN KEY (kode_provinsi) REFERENCES provinsi (kode_provinsi)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS kabupaten_nama_idx ON kabupaten (nama_kabupaten);

-- kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    kode_provinsi CHAR(2) NOT NULL,
    kode_kabupaten CHAR(2) NOT NULL,
    kode_kecamatan CHAR(2) NOT NULL,
    nama_kecamatan VARCHAR(255) NOT NULL,
    PRIMARY KEY (kode_provinsi, kode_kabupaten, kode_kecamatan),
    FOREIGN KEY (kode_provinsi, kode_kabupaten) REFERENCES kabupaten (kode_provinsi, kode_kabupaten)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS kecamatan_nama_idx ON kecamatan (nama_kecamatan);

-- kelurahan
CREATE TABLE IF NOT EXISTS kelurahan (
    kode_provinsi CHAR(2) NOT NULL,
    kode_kabupaten CHAR(2) NOT NULL,
    kode_kecamatan CHAR(2) NOT NULL,
    kode_kelurahan CHAR(4) NOT NULL,
    nama_kelurahan VARCHAR(255) NOT NULL,
    kode_pos CHAR(5) NULL,
    PRIMARY KEY (kode_provinsi, kode_kabupaten, kode_kecamatan, kode_kelurahan, kode_pos),
    FOREIGN KEY (kode_provinsi, kode_kabupaten, kode_kecamatan) REFERENCES kecamatan (kode_provinsi, kode_kabupaten, kode_kecamatan)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS kelurahan_nama_idx ON kelurahan (nama_kelurahan);
