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
    return `"${value.replace(/'/g, "\\'").replace(/"/g, '\\"')}"`;
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
