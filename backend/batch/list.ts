import { api, Query } from "encore.dev/api";
import db from "../db";

interface ListBatchRequest {
  id_barang?: Query<number>;
}

interface Batch {
  id: number;
  id_barang: number;
  nama_barang: string;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  stok_tersedia: number;
  catatan_penerimaan: string | null;
}

interface ListBatchResponse {
  items: Batch[];
}

// Retrieves all batches, optionally filtered by barang.
export const list = api<ListBatchRequest, ListBatchResponse>(
  { expose: true, method: "GET", path: "/batch" },
  async (req) => {
    let rows: Batch[];
    
    if (req.id_barang) {
      rows = await db.queryAll<Batch>`
        SELECT 
          bt.id,
          bt.id_barang,
          b.nama_barang,
          bt.nomor_batch,
          bt.harga_perolehan,
          bt.tanggal_kadaluarsa,
          bt.stok_tersedia,
          bt.catatan_penerimaan
        FROM batch bt
        JOIN barang b ON b.id = bt.id_barang
        WHERE bt.id_barang = ${req.id_barang}
        ORDER BY bt.tanggal_kadaluarsa ASC NULLS LAST
      `;
    } else {
      rows = await db.queryAll<Batch>`
        SELECT 
          bt.id,
          bt.id_barang,
          b.nama_barang,
          bt.nomor_batch,
          bt.harga_perolehan,
          bt.tanggal_kadaluarsa,
          bt.stok_tersedia,
          bt.catatan_penerimaan
        FROM batch bt
        JOIN barang b ON b.id = bt.id_barang
        ORDER BY b.nama_barang ASC, bt.tanggal_kadaluarsa ASC NULLS LAST
      `;
    }
    
    return { items: rows };
  }
);
