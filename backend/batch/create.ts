import { api } from "encore.dev/api";
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
