import { SQL } from "bun";
import { fetchMaster } from "./utils";
import { writeCSV } from "./utils/write-csv";

interface WilayahResult {
  kode: string;
  nama: string;
}

interface DataProvinsi {
  kode_provinsi: string;
  nama_provinsi: string;
}

interface DataKabupaten {
  kode_provinsi: string;
  kode_kabupaten: string;
  nama_kabupaten: string;
}

interface DataKecamatan {
  kode_provinsi: string;
  kode_kabupaten: string;
  kode_kecamatan: string;
  nama_kecamatan: string;
}

interface DataKelurahan {
  kode_provinsi: string;
  kode_kabupaten: string;
  kode_kecamatan: string;
  kode_kelurahan: string;
  nama_kelurahan: string;
}

const sql = new SQL({
  adapter: 'mariadb',
})

try {
  await sql.connect();
} catch (error) {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
}

console.log("Fetching the master SQL file...");
const masterSql = await fetchMaster();
if (!masterSql) {
  console.error("Failed to fetch the master SQL file.");
  process.exit(1);
}

console.log('Importing wilayah data from master SQL file...');
await sql.unsafe(masterSql);

console.log('Processing wilayah data...');
const result = await sql<WilayahResult[]>`select * from wilayah`;
const provinsi: Map<string, DataProvinsi> = new Map();
const kabupaten: Map<string, DataKabupaten> = new Map();
const kecamatan: Map<string, DataKecamatan> = new Map();
const kelurahan: Map<string, DataKelurahan> = new Map();
const total = result.length;
console.log(`Total records to process: ${total}`);

for (const row of result) {
  const codes = row.kode.split('.');

  if (codes.length === 1) {
    provinsi.set(row.kode, {
      kode_provinsi: codes[0],
      nama_provinsi: row.nama,
    });
  } else if (codes.length === 2) {
    const kode_provinsi = codes[0];
    const kode_kabupaten = codes[1];
    if (!provinsi.has(kode_provinsi)) {
      console.log(`Provinsi with code ${kode_provinsi} not found for kabupaten ${row.nama}`);
      continue;
    }
    const prov = provinsi.get(kode_provinsi)!;

    kabupaten.set(row.kode, {
      kode_provinsi: prov.kode_provinsi,
      kode_kabupaten: kode_kabupaten,
      nama_kabupaten: row.nama,
    });
  } else if (codes.length === 3) {
    const kode_provinsi = codes[0];
    const kode_kabupaten = codes[1];
    const kode_kecamatan = codes[2];
    if (!kabupaten.has(`${kode_provinsi}.${kode_kabupaten}`)) {
      console.log(`Kabupaten with code ${kode_provinsi}.${kode_kabupaten} not found for kecamatan ${row.nama}`);
      continue;
    }
    const kab = kabupaten.get(`${kode_provinsi}.${kode_kabupaten}`)!;

    kecamatan.set(row.kode, {
      kode_provinsi: kab.kode_provinsi,
      kode_kabupaten: kab.kode_kabupaten,
      kode_kecamatan: kode_kecamatan,
      nama_kecamatan: row.nama,
    });
  } else if (codes.length === 4) {
    const kode_provinsi = codes[0];
    const kode_kabupaten = codes[1];
    const kode_kecamatan = codes[2];
    const kode_kelurahan = codes[3];
    if (!kecamatan.has(`${kode_provinsi}.${kode_kabupaten}.${kode_kecamatan}`)) {
      console.log(`Kecamatan with code ${kode_provinsi}.${kode_kabupaten}.${kode_kecamatan} not found for kelurahan ${row.nama}`);
      continue;
    }
    const kec = kecamatan.get(`${kode_provinsi}.${kode_kabupaten}.${kode_kecamatan}`)!;

    kelurahan.set(row.kode, {
      kode_provinsi: kec.kode_provinsi,
      kode_kabupaten: kec.kode_kabupaten,
      kode_kecamatan: kec.kode_kecamatan,
      kode_kelurahan: kode_kelurahan,
      nama_kelurahan: row.nama,
    });
  }
}

console.log(`Total Provinsi: ${provinsi.size}`);
console.log(`Total Kabupaten: ${kabupaten.size}`);
console.log(`Total Kecamatan: ${kecamatan.size}`);
console.log(`Total Kelurahan: ${kelurahan.size}`);

console.log('Writing data to CSV files...');
await writeCSV(Array.from(provinsi.values()), 'db/data-provinsi.csv');
await writeCSV(Array.from(kabupaten.values()), 'db/data-kabupaten.csv');
await writeCSV(Array.from(kecamatan.values()), 'db/data-kecamatan.csv');
await writeCSV(Array.from(kelurahan.values()), 'db/data-kelurahan.csv');

console.log("Connected to the database successfully.");

sql.close();
