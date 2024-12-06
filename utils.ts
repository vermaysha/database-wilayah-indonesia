import { Database } from "bun:sqlite";
import * as fs from "node:fs";

export function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error("Size must be greater than 0");
  }

  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function escapeSQLValue(value: string) {
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return value ?? "NULL";
}

export function generateInsertQuery(
  tableName: string,
  columns: string[],
  valuesArray: string[][]
) {
  if (!Array.isArray(valuesArray) || valuesArray.length === 0) {
    throw new Error("Values array must be a non-empty array.");
  }

  const escapedValues = valuesArray.map((row) => {
    if (!Array.isArray(row) || row.length !== columns.length) {
      throw new Error("Each row must be an array and match the column count.");
    }
    return `(${row.map(escapeSQLValue).join(", ")})`;
  });

  const columnsString = columns.map((col) => `"${col}"`).join(", ");
  const query = `INSERT OR REPLACE INTO ${tableName} (${columnsString}) VALUES ${escapedValues.join(
    ", "
  )};`;
  return query;
}

export async function fetchData(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();

    // Menyimpan data ke dalam variabel
    const wilayahData: string = data;

    return wilayahData;
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data:", error);
    throw error;
  }
}

export const getWilayah = async () => {
  return fetchData('https://raw.githubusercontent.com/cahyadsn/wilayah/refs/heads/master/db/wilayah.sql');
}

export const getKodePos = async () => {
  return fetchData('https://raw.githubusercontent.com/cahyadsn/wilayah_kodepos/refs/heads/main/db/wilayah_kodepos.sql');
}

/**
 * Export all tables in a SQLite database to CSV files.
 * @param dbPath - Path to the SQLite database file.
 * @param outputDir - Directory to store the generated CSV files.
 */
export async function exportTablesToCSV(dbPath: string, outputDir: string): Promise<void> {
  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Open the SQLite database
  const db = new Database(dbPath);

  try {
    // Get the list of all tables
    const tables = db.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    ).all() as { name: string }[];

    for (const table of tables) {
      const tableName = table.name;

      // Query all rows from the table
      const rows = db.query(`SELECT * FROM "${tableName}";`).all();

      // Get the column names
      const columnNames = Object.keys(rows[0] || {});

      // Generate the CSV content
      const csvContent = [
        columnNames.join(","), // Header row
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ...rows.map((row: any) =>
          columnNames.map((col) => JSON.stringify(row[col] || "")).join(",")
        ),
      ].join("\n");

      // Write the CSV content to a file
      const outputPath = `${outputDir}/data-${tableName}.csv`;
      fs.writeFileSync(outputPath, csvContent);

      console.log(`Exported table '${tableName}' to '${outputPath}'`);
    }
  } catch (error) {
    console.error("Error exporting tables:", error);
  } finally {
    // Close the database
    db.close();
  }
}
