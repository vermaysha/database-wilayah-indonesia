SELECT *
FROM wilayah
WHERE
    LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) = 0;
