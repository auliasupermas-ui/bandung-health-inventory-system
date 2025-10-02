import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdateSaranaRequest {
  id: number;
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

export const update = api<UpdateSaranaRequest, Sarana>(
  { expose: true, method: "PUT", path: "/sarana/:id" },
  async (req) => {
    const row = await db.queryRow<Sarana>`
      UPDATE sarana
      SET 
        kode_sarana = ${req.kode_sarana},
        nama_sarana = ${req.nama_sarana},
        alamat = ${req.alamat ?? null},
        telepon = ${req.telepon ?? null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
      RETURNING id, kode_sarana, nama_sarana, alamat, telepon
    `;
    if (!row) {
      throw APIError.notFound("sarana not found");
    }
    return row;
  }
);
