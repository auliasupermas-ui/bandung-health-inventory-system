import { api } from "encore.dev/api";
import db from "../db";

export interface Sarana {
  id: number;
  kode_sarana: string;
  nama_sarana: string;
  alamat: string | null;
  telepon: string | null;
}

interface ListSaranaResponse {
  items: Sarana[];
}

export const list = api<void, ListSaranaResponse>(
  { expose: true, method: "GET", path: "/sarana" },
  async () => {
    const rows = await db.queryAll<Sarana>`
      SELECT id, kode_sarana, nama_sarana, alamat, telepon
      FROM sarana
      ORDER BY nama_sarana ASC
    `;
    return { items: rows };
  }
);
