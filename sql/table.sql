DROP TABLE IF EXISTS kabupaten;
DROP TABLE IF EXISTS kecamatan;
DROP TABLE IF EXISTS kelurahan;
DROP TABLE IF EXISTS desa;

-- Kabupaten
CREATE TABLE IF NOT EXISTS kabupaten (
    kode_kabupaten TEXT PRIMARY KEY,
    nama_kabupaten TEXT
);

CREATE INDEX IF NOT EXISTS kabupaten_nama_idx ON kabupaten (nama_kabupaten);

-- Kecamatan
CREATE TABLE IF NOT EXISTS kecamatan (
    kode_kabupaten TEXT,
    kode_kecamatan TEXT,
    nama_kecamatan TEXT,
    PRIMARY KEY (
        kode_kabupaten,
        kode_kecamatan
    ),
    FOREIGN KEY (kode_kabupaten) REFERENCES kabupaten (kode_kabupaten)
);

CREATE INDEX IF NOT EXISTS kecamatan_nama_idx ON kecamatan (nama_kecamatan);

-- Kelurahan
CREATE TABLE IF NOT EXISTS kelurahan (
    kode_kabupaten TEXT,
    kode_kecamatan TEXT,
    kode_kelurahan TEXT,
    nama_kelurahan TEXT,
    PRIMARY KEY (
        kode_kabupaten,
        kode_kecamatan,
        kode_kelurahan
    ),
    FOREIGN KEY (kode_kabupaten) REFERENCES kabupaten (kode_kabupaten),
    FOREIGN KEY (kode_kecamatan) REFERENCES kecamatan (kode_kecamatan)
);

CREATE INDEX IF NOT EXISTS kelurahan_nama_idx ON kelurahan (nama_kelurahan);

-- Desa
CREATE TABLE IF NOT EXISTS desa (
    kode_kabupaten TEXT,
    kode_kecamatan TEXT,
    kode_kelurahan TEXT,
    kode_desa TEXT,
    nama_desa TEXT,
    kode_pos TEXT,
    PRIMARY KEY (
        kode_kabupaten,
        kode_kecamatan,
        kode_kelurahan,
        kode_desa,
        kode_pos
    ),
    FOREIGN KEY (kode_kabupaten) REFERENCES kabupaten (kode_kabupaten),
    FOREIGN KEY (kode_kecamatan) REFERENCES kecamatan (kode_kecamatan),
    FOREIGN KEY (kode_kelurahan) REFERENCES kelurahan (kode_kelurahan)
);

CREATE INDEX IF NOT EXISTS desa_nama_idx ON desa (nama_desa);
