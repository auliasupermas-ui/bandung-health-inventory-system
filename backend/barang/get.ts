import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetBarangRequest {
  id: number;
}

interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
}

// Retrieves a single barang by ID.
export const get = api<GetBarangRequest, Barang>(
  { expose: true, method: "GET", path: "/barang/:id" },
  async (req) => {
    const row = await db.queryRow<Barang>`
      SELECT id, kode_barang, nama_barang, satuan
      FROM barang
      WHERE id = ${req.id}
    `;
    if (!row) {
      throw APIError.notFound("barang not found");
    }
    return row;
  }
);
