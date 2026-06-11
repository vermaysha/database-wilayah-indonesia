# Database Wilayah Indonesia (CSV/JSON/TSV)

Script untuk mengambil data wilayah Indonesia dari repository sumber dan mengkonversinya ke format **CSV**, **JSON**, dan **TSV** yang dapat digunakan secara mandiri oleh aplikasi lain.

Data yang dihasilkan mencakup:
- Provinsi
- Kabupaten
- Kecamatan
- Kelurahan/Desa (dengan kode pos)

## Output

Script akan menghasilkan file di folder `db/` dalam beberapa format:

### Format Internasional (field names: English)

| Folder | Format | File |
|--------|--------|------|
| `db/json/` | JSON | `01province.json`, `02regency.json`, `03district.json`, `04village.json` |
| `db/csv/` | CSV | `01province.csv`, `02regency.csv`, `03district.csv`, `04village.csv` |
| `db/tsv/` | TSV | `01province.tsv`, `02regency.tsv`, `03district.tsv`, `04village.tsv` |

### Format Indonesia (field names: Bahasa Indonesia)

| File | Isi |
|------|-----|
| `db/data-provinsi.csv` | Data provinsi |
| `db/data-kabupaten.csv` | Data kabupaten |
| `db/data-kecamatan.csv` | Data kecamatan |
| `db/data-kelurahan.csv` | Data kelurahan/desa beserta kode pos |

## Sumber Data

Data disadur dari repository berikut:

1. [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah)
2. [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos)

Terimakasih saya ucapkan kepada [@cahyadsn](https://github.com/cahyadsn) yang telah menyediakan data tersebut.

## Cara Menjalankan

Pastikan sudah terinstall [Bun](https://bun.sh/docs/installation). Kemudian jalankan script dengan perintah berikut:

```bash
bun install
bun run .
```

Hasilnya akan tersimpan di folder `db/` dan siap digunakan oleh aplikasi Anda.
