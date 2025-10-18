import { writeToBuffer } from '@fast-csv/format';

export const writeCSV = async (data: any[], dest: string, delimiter = ',') => {
  const buffer = await writeToBuffer(data, { headers: true, quoteColumns: true, delimiter, escape: '"', quoteHeaders: false });
  await Bun.file(dest).write(buffer);
}
