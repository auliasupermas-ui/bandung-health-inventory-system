import { api } from "encore.dev/api";
import db from "../db";

interface CreateSaranaRequest {
  kode_sarana: string;
  nama_sarana: string;
  alamat?: string;
  telepon?: string;
}

interface Sarana {
  id: number;
  kode_sarana: string;
  nama_sarana: string;
  alamat: string | null;
  telepon: string | null;
}

export const create = api<CreateSaranaRequest, Sarana>(
  { expose: true, method: "POST", path: "/sarana" },
  async (req) => {
    const row = await db.queryRow<Sarana>`
      INSERT INTO sarana (kode_sarana, nama_sarana, alamat, telepon)
      VALUES (${req.kode_sarana}, ${req.nama_sarana}, ${req.alamat ?? null}, ${req.telepon ?? null})
      RETURNING id, kode_sarana, nama_sarana, alamat, telepon
    `;
    return row!;
  }
);
