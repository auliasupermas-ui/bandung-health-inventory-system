import { api, Query } from "encore.dev/api";
import db from "../db";

interface StokPerBatchRequest {
  id_barang?: Query<number>;
}

interface StokBatch {
  id_batch: number;
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  stok_tersedia: number;
  nilai_persediaan: number;
}

interface StokPerBatchResponse {
  items: StokBatch[];
}

// Retrieves stock per batch with inventory value.
export const stokPerBatch = api<StokPerBatchRequest, StokPerBatchResponse>(
  { expose: true, method: "GET", path: "/laporan/stok-per-batch" },
  async (req) => {
    let query = `
      SELECT 
        bt.id as id_batch,
        b.id as id_barang,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        bt.nomor_batch,
        bt.harga_perolehan,
        bt.tanggal_kadaluarsa,
        bt.stok_tersedia,
        (bt.stok_tersedia * bt.harga_perolehan) as nilai_persediaan
      FROM batch bt
      JOIN barang b ON b.id = bt.id_barang
      WHERE bt.stok_tersedia > 0
    `;
    const params: any[] = [];

    if (req.id_barang) {
      query += ` AND bt.id_barang = $1`;
      params.push(req.id_barang);
    }

    query += ` ORDER BY b.nama_barang ASC, bt.tanggal_kadaluarsa ASC NULLS LAST`;

    const rows = await db.rawQueryAll<StokBatch>(query, ...params);
    return { items: rows };
  }
);
