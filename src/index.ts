import { sql } from "bun";
import { mkdir, rm } from "fs/promises";
await sql.connect();

type DelimitedOptions = {
  delimiter?: string;
  header?: boolean;
};

export function objectsToDelimited<T extends Record<string, unknown>>(
  data: T[],
  {
    delimiter = ',',
    header = true,
  }: DelimitedOptions = {}
): string {
  if (data.length === 0) {
    return '';
  }

  const columns = Object.keys(data[0]!) as (keyof T)[];

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) {
      return '""';
    }

    const str = String(value);

    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows: string[] = [];

  if (header) {
    rows.push(columns.join(delimiter));
  }

  for (const row of data) {
    rows.push(
      columns
        .map(column => escape(row[column]))
        .join(delimiter)
    );
  }

  return rows.join('\n');
}


const wilayahSource = 'https://raw.githubusercontent.com/cahyadsn/wilayah/refs/heads/master/db/wilayah.sql';
const kodeposSource = 'https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/refs/heads/main/db/wilayah_kodepos.sql';

const wilayahResponse = await fetch(wilayahSource).then(res => res.text());
const kodeposResponse = await fetch(kodeposSource).then(res => res.text());

await sql.unsafe(wilayahResponse);
await sql.unsafe(kodeposResponse);

const provinceLists = await sql<{ kode: string, nama: string }[]>`SELECT * FROM wilayah WHERE LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) + 1 = 1;`;
const regencyLists = (await sql<{ kode: string, nama: string }[]>`SELECT * FROM wilayah WHERE LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) + 1 = 2;`)
const districtLists = await sql<{ kode: string, nama: string }[]>`SELECT * FROM wilayah WHERE LENGTH(kode) - LENGTH(REPLACE(kode, '.', '')) + 1 = 3;`;
const villageLists = await sql<{ kode: string, nama: string, kodepos: string }[]>`SELECT
  w.*,
  wk.*
FROM wilayah w
INNER JOIN wilayah_kodepos wk
    ON wk.kode = w.kode
WHERE LENGTH(w.kode) - LENGTH(REPLACE(w.kode, '.', '')) + 1 = 4;`;

const provinceData = provinceLists.map((province) => ({
  province_id: province.kode,
  province_name: province.nama,
}));

const regencyData = regencyLists.map((regency) => {
  const [province_id, regency_id] = regency.kode.split('.');

  return {
    regency_id: `${province_id}${regency_id}`,
    province_id,
    regency_name: regency.nama,
  }
});

const districtData = districtLists.map((district) => {
  const [province_id, regency_id, district_id] = district.kode.split('.');

  return {
    district_id: `${province_id}${regency_id}${district_id}`,
    province_id,
    regency_id: `${province_id}${regency_id}`,
    district_name: district.nama,
  }
});

const villageData = villageLists.map((village) => {
  const [province_id, regency_id, district_id, village_id] = village.kode.split('.');

  return {
    village_id: `${province_id}${regency_id}${district_id}${village_id}`,
    province_id,
    regency_id: `${province_id}${regency_id}`,
    district_id: `${province_id}${regency_id}${district_id}`,
    village_name: village.nama,
    postal_code: village.kodepos,
  }
});

await rm('db', { recursive: true, force: true });

await mkdir('db/json', { recursive: true });
await mkdir('db/csv', { recursive: true });
await mkdir('db/tsv', { recursive: true });

Bun.file('db/json/01province.json').write(JSON.stringify(provinceData, null, 2));
Bun.file('db/json/02regency.json').write(JSON.stringify(regencyData, null, 2));
Bun.file('db/json/03district.json').write(JSON.stringify(districtData, null, 2));
Bun.file('db/json/04village.json').write(JSON.stringify(villageData, null, 2));

Bun.file('db/csv/01province.csv').write(objectsToDelimited(provinceData, { delimiter: ',' }));
Bun.file('db/csv/02regency.csv').write(objectsToDelimited(regencyData, { delimiter: ',' }));
Bun.file('db/csv/03district.csv').write(objectsToDelimited(districtData, { delimiter: ',' }));
Bun.file('db/csv/04village.csv').write(objectsToDelimited(villageData, { delimiter: ',' }));

Bun.file('db/tsv/01province.tsv').write(objectsToDelimited(provinceData, { delimiter: '\t' }));
Bun.file('db/tsv/02regency.tsv').write(objectsToDelimited(regencyData, { delimiter: '\t' }));
Bun.file('db/tsv/03district.tsv').write(objectsToDelimited(districtData, { delimiter: '\t' }));
Bun.file('db/tsv/04village.tsv').write(objectsToDelimited(villageData, { delimiter: '\t' }));


const normalizedProvinceData = provinceLists.map((province) => {
  const [province_id] = province.kode.split('.');
  return {
    kode_provinsi: province_id,
    nama_provinsi: province.nama,
  };
});

const normalizedRegencyData = regencyLists.map((regency) => {
  const [province_id, regency_id] = regency.kode.split('.');
  return {
    kode_kabupaten: `${regency_id}`,
    kode_provinsi: province_id,
    nama_kabupaten: regency.nama,
  };
});

const normalizedDistrictData = districtLists.map((district) => {
  const [province_id, regency_id, district_id] = district.kode.split('.');
  return {
    kode_kecamatan: `${district_id}`,
    kode_provinsi: province_id,
    kode_kabupaten: `${regency_id}`,
    nama_kecamatan: district.nama,
  };
});

const normalizedVillageData = villageLists.map((village) => {
  const [province_id, regency_id, district_id, village_id] = village.kode.split('.');
  return {
    kode_desa: `${village_id}`,
    kode_provinsi: province_id,
    kode_kabupaten: `${regency_id}`,
    kode_kecamatan: `${district_id}`,
    nama_kelurahan: village.nama,
    kode_pos: village.kodepos,
  };
});

Bun.file('db/data-provinsi.csv').write(objectsToDelimited(normalizedProvinceData, { delimiter: ',' }));
Bun.file('db/data-kabupaten.csv').write(objectsToDelimited(normalizedRegencyData, { delimiter: ',' }));
Bun.file('db/data-kecamatan.csv').write(objectsToDelimited(normalizedDistrictData, { delimiter: ',' }));
Bun.file('db/data-kelurahan.csv').write(objectsToDelimited(normalizedVillageData, { delimiter: ',' }));
