import { api } from "encore.dev/api";
import db from "../db";

interface GetBatchByBarangRequest {
  id_barang: number;
}

interface Batch {
  id: number;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  stok_tersedia: number;
  catatan_penerimaan: string | null;
}

interface GetBatchByBarangResponse {
  items: Batch[];
}

// Retrieves all batches for a specific barang, ordered by FEFO.
export const getByBarang = api<GetBatchByBarangRequest, GetBatchByBarangResponse>(
  { expose: true, method: "GET", path: "/batch/barang/:id_barang" },
  async (req) => {
    const rows = await db.queryAll<Batch>`
      SELECT 
        id, nomor_batch, harga_perolehan, 
        tanggal_kadaluarsa, stok_tersedia, catatan_penerimaan
      FROM batch
      WHERE id_barang = ${req.id_barang} AND stok_tersedia > 0
      ORDER BY tanggal_kadaluarsa ASC NULLS LAST
    `;
    return { items: rows };
  }
);
