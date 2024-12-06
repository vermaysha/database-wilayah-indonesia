import { Database } from "bun:sqlite";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import {
  chunkArray,
  exportTablesToCSV,
  generateInsertQuery,
  getKodePos,
  getWilayah,
} from "./utils";

rmSync("./db", { recursive: true, force: true });
mkdirSync("./db", { recursive: true });

const wilayahSql = await getWilayah();
const wilayahDB = new Database(":memory:");
const db = new Database("./db/wilayah.sqlite");
const kodePosSql = await getKodePos();
const kodePosDB = new Database(":memory:");

const table = readFileSync("./sql/table.sql", "utf-8");
// let dbSql = "";

wilayahDB.run(wilayahSql);
kodePosDB.run(kodePosSql);
const kodePos = new Map();

for (const el of kodePosDB
  .query("SELECT * from wilayah_kodepos")
  .all()
  .map((val) => Object.values(val as object))) {
  kodePos.set(el[0], el[1]);
}

db.run(table);

const provinsi = wilayahDB
  .query(readFileSync("./sql/provinsi.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object))
  .map((val) => {
    if (typeof val[val.length - 1] !== "string") return val;
    const name = val[val.length - 1];

    val[val.length - 1] = name.includes("DKI")
      ? "DKI Jakarta"
      : String(name)
          .toLowerCase()
          .split(" ")
          .map((val) => val.charAt(0).toUpperCase() + val.slice(1))
          .join(" ");

    return val;
  });

const kabupaten = wilayahDB
  .query(readFileSync("./sql/kabupaten.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object))
  .map((val) => {
    if (typeof val[val.length - 1] !== "string") return val;
    val[val.length - 1] = String(val[val.length - 1])
      .toLowerCase()
      .split(" ")
      .map((val) => val.charAt(0).toUpperCase() + val.slice(1))
      .join(" ")
      .replace("Kab.", "Kabupaten");
    return val;
  });

const kecamatan = wilayahDB
  .query(readFileSync("./sql/kecamatan.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object));

const kelurahan = wilayahDB
  .query(readFileSync("./sql/kelurahan.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object))
  .map((val) => {
    const key = `${val[0]}.${val[1]}.${val[2]}.${val[3]}`;
    const pos = kodePos.get(key) ?? null;
    val.push(pos);
    return val;
  });

console.log("Update data provinsi");
db.run(
  generateInsertQuery(
    "provinsi",
    ["kode_provinsi", "nama_provinsi"],
    provinsi
  )
);
// dbSql += `${generateInsertQuery(
//   "kabupaten",
//   ["kode_provinsi", "nama_provinsi"],
//   kabupaten
// )}\n\n`;

console.log("Update data kabupaten");
for (const item of chunkArray(kabupaten, 100)) {
  const sql = generateInsertQuery(
    "kabupaten",
    ["kode_provinsi", "kode_kabupaten", "nama_kabupaten"],
    item
  );
  db.run(sql);
  // dbSql += `${sql}\n\n`;
}

console.log("Update data kecamatan");
for (const item of chunkArray(kecamatan, 500)) {
  const sql = generateInsertQuery(
    "kecamatan",
    ["kode_provinsi", "kode_kabupaten", "kode_kecamatan", "nama_kecamatan"],
    item
  );
  db.run(sql);
  // dbSql += `${sql}\n\n`;
}

console.log("Update data kelurahan");
for (const item of chunkArray(kelurahan, 1000)) {
  const sql = generateInsertQuery(
    "kelurahan",
    [
      "kode_provinsi",
      "kode_kabupaten",
      "kode_kecamatan",
      "kode_kelurahan",
      "nama_kelurahan",
      "kode_pos",
    ],
    item
  );

  db.run(sql);
  // dbSql += `${sql}\n\n`;
}

writeFileSync('./db/wilayah.schema-sqlite.sql', readFileSync('./sql/table.sql', 'utf-8'));
writeFileSync('./db/wilayah.schema-general.sql', readFileSync('./sql/table.general.sql', 'utf-8'));
exportTablesToCSV('./db/wilayah.sqlite', './db');

console.log(
  "Selesai, data dapat dilihat pada file berikut ./db/wilayah.sqlite"
);
