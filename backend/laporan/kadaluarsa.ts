import { api, Query } from "encore.dev/api";
import db from "../db";

interface KadaluarsaRequest {
  hari?: Query<number>;
}

interface BatchKadaluarsa {
  id_batch: number;
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date;
  stok_tersedia: number;
  hari_tersisa: number;
}

interface KadaluarsaResponse {
  items: BatchKadaluarsa[];
}

// Retrieves batches nearing expiry.
export const kadaluarsa = api<KadaluarsaRequest, KadaluarsaResponse>(
  { expose: true, method: "GET", path: "/laporan/kadaluarsa" },
  async (req) => {
    const hari = req.hari ?? 150;

    const rows = await db.queryAll<BatchKadaluarsa>`
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
        (bt.tanggal_kadaluarsa - CURRENT_DATE)::INT as hari_tersisa
      FROM batch bt
      JOIN barang b ON b.id = bt.id_barang
      WHERE bt.tanggal_kadaluarsa IS NOT NULL
        AND bt.stok_tersedia > 0
        AND bt.tanggal_kadaluarsa <= (CURRENT_DATE + ${hari})
      ORDER BY bt.tanggal_kadaluarsa ASC
    `;

    return { items: rows };
  }
);
