import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import {
  chunkArray,
  generateInsertQuery,
  getKodePos,
  getWilayah,
} from "./utils";

const wilayahSql = await getWilayah();
const wilayahDB = new Database(":memory:");
const db = new Database("./db/wilayah.sqlite");
const kodePosSql = await getKodePos();
const kodePosDB = new Database(":memory:");

const table = readFileSync("./sql/table.sql", "utf-8");

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

const kabupaten = wilayahDB
  .query(readFileSync("./sql/kabupaten.sql", "utf-8"))
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

const kecamatan = wilayahDB
  .query(readFileSync("./sql/kecamatan.sql", "utf-8"))
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

const kelurahan = wilayahDB
  .query(readFileSync("./sql/kelurahan.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object));

const desa = wilayahDB
  .query(readFileSync("./sql/desa.sql", "utf-8"))
  .all()
  .map((val) => Object.values(val as object))
  .map((val) => {
    const key = `${val[0]}.${val[1]}.${val[2]}.${val[3]}`;
    const pos = kodePos.get(key) ?? null;
    val.push(pos);
    return val;
  });

console.log("Update data kabupaten");
db.run(generateInsertQuery("kabupaten", ["kode_kabupaten", "nama_kabupaten"], kabupaten));

console.log("Update data kecamatan");
for (const item of chunkArray(kecamatan, 100)) {
  db.run(
    generateInsertQuery(
      "kecamatan",
      ["kode_kabupaten", "kode_kecamatan", "nama_kecamatan"],
      item
    )
  );
}

console.log("Update data kelurahan");
for (const item of chunkArray(kelurahan, 500)) {
  db.run(
    generateInsertQuery(
      "kelurahan",
      ["kode_kabupaten", "kode_kecamatan", "kode_kelurahan", "nama_kelurahan"],
      item
    )
  );
}

console.log("Update data desa");
for (const item of chunkArray(desa, 1000)) {
  db.run(
    generateInsertQuery(
      "desa",
      [
        "kode_kabupaten",
        "kode_kecamatan",
        "kode_kelurahan",
        "kode_desa",
        "nama_desa",
        "kode_pos",
      ],
      item
    )
  );
}

console.log("Selesai, data dapat dilihat pada file berikut ./db/wilayah.sqlite");
