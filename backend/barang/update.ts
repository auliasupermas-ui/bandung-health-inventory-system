import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdateBarangRequest {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
}

interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
}

// Updates an existing barang.
export const update = api<UpdateBarangRequest, Barang>(
  { expose: true, method: "PUT", path: "/barang/:id" },
  async (req) => {
    const row = await db.queryRow<Barang>`
      UPDATE barang
      SET 
        kode_barang = ${req.kode_barang},
        nama_barang = ${req.nama_barang},
        satuan = ${req.satuan},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
      RETURNING id, kode_barang, nama_barang, satuan
    `;
    if (!row) {
      throw APIError.notFound("barang not found");
    }
    return row;
  }
);
