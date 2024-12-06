SELECT
    substr(kode, 1, instr(kode, '.') - 1) AS kode_kabupaten, -- Bagian sebelum tanda "-"
    substr(kode, instr(kode, '.') + 1) AS kode_kecamatan, -- Bagian setelah tanda "-"
    nama
FROM wilayah
WHERE
    LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) = 1;
