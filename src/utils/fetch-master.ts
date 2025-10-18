import { fetch } from "bun";

export const fetchMaster = async () => {
  const masterUrl = 'https://raw.githubusercontent.com/cahyadsn/wilayah/refs/heads/master/db/wilayah.sql';

  const response = await fetch(masterUrl);
  if (!response.ok) {
    return null;
  }

  const sqlContent = await response.text();
  return sqlContent;
}
