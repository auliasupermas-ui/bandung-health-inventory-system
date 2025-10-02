import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateBatchRequest {
  id_barang: number;
  nomor_batch?: string;
  harga_perolehan: number;
  tanggal_kadaluarsa?: Date;
  stok_tersedia: number;
  catatan_penerimaan?: string;
}

interface Batch {
  id: number;
  id_barang: number;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  stok_tersedia: number;
  catatan_penerimaan: string | null;
}

// Creates a new batch for a barang.
export const create = api<CreateBatchRequest, Batch>(
  { expose: true, method: "POST", path: "/batch" },
  async (req) => {
    if (req.stok_tersedia < 0) {
      throw APIError.invalidArgument("Stock must be zero or positive");
    }

    if (req.harga_perolehan < 0) {
      throw APIError.invalidArgument("Price must be zero or positive");
    }

    if (req.tanggal_kadaluarsa) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(req.tanggal_kadaluarsa);
      expiryDate.setHours(0, 0, 0, 0);

      if (expiryDate <= today) {
        throw APIError.invalidArgument("Expiry date must be in the future");
      }
    }

    const row = await db.queryRow<Batch>`
      INSERT INTO batch (
        id_barang, nomor_batch, harga_perolehan, 
        tanggal_kadaluarsa, stok_tersedia, catatan_penerimaan
      )
      VALUES (
        ${req.id_barang}, 
        ${req.nomor_batch ?? null}, 
        ${req.harga_perolehan},
        ${req.tanggal_kadaluarsa ?? null}, 
        ${req.stok_tersedia}, 
        ${req.catatan_penerimaan ?? null}
      )
      RETURNING 
        id, id_barang, nomor_batch, harga_perolehan, 
        tanggal_kadaluarsa, stok_tersedia, catatan_penerimaan
    `;
    return row!;
  }
);
