SELECT
    substr(kode, 1, instr(kode, '.') - 1) AS kode_kabupaten, -- Bagian sebelum tanda "-"
    substr(
        kode,
        instr(kode, '.') + 1,
        instr(
            substr(kode, instr(kode, '.') + 1),
            '.'
        ) - 1
    ) as part2,
    substr(
        kode,
        instr(kode, '.') + 4,
        instr(
            substr(kode, instr(kode, '.') + 1),
            '.'
        ) -1
    ) as part3,
    substr(
        kode,
        instr(kode, '.') + 7,
        instr(
            substr(kode, instr(kode, '.') + 1),
            '.'
        ) + 2
    ) as part4,
    nama
FROM wilayah
WHERE
    LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) = 3;
