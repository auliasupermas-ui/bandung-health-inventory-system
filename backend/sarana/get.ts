import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetSaranaRequest {
  id: number;
}

interface Sarana {
  id: number;
  kode_sarana: string;
  nama_sarana: string;
  alamat: string | null;
  telepon: string | null;
}

export const get = api<GetSaranaRequest, Sarana>(
  { expose: true, method: "GET", path: "/sarana/:id" },
  async (req) => {
    const row = await db.queryRow<Sarana>`
      SELECT id, kode_sarana, nama_sarana, alamat, telepon
      FROM sarana
      WHERE id = ${req.id}
    `;
    if (!row) {
      throw APIError.notFound("sarana not found");
    }
    return row;
  }
);
