import { api, Query } from "encore.dev/api";
import db from "../db";

interface BukuBarangRequest {
  tanggal_cutoff: Query<Date>;
  id_barang?: Query<number>;
}

interface BukuBarangBatch {
  id_batch: number;
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  saldo_awal: number;
  total_masuk: number;
  total_keluar: number;
  saldo_akhir: number;
}

interface BukuBarangResponse {
  items: BukuBarangBatch[];
}

// Retrieves stock position as of a specific date (cut-off).
export const bukuBarang = api<BukuBarangRequest, BukuBarangResponse>(
  { expose: true, method: "GET", path: "/laporan/buku-barang" },
  async (req) => {
    let query = `
      WITH transaksi_masuk AS (
        SELECT 
          td.id_batch,
          COALESCE(SUM(td.jumlah), 0) as total_masuk
        FROM transaksi_detail td
        JOIN transaksi t ON t.id = td.id_transaksi
        WHERE t.status = 'confirmed' 
          AND t.jenis_transaksi = 'penerimaan'
          AND t.tanggal_transaksi <= $1
        GROUP BY td.id_batch
      ),
      transaksi_keluar AS (
        SELECT 
          td.id_batch,
          COALESCE(SUM(td.jumlah), 0) as total_keluar
        FROM transaksi_detail td
        JOIN transaksi t ON t.id = td.id_transaksi
        WHERE t.status = 'confirmed' 
          AND t.jenis_transaksi IN ('pengeluaran', 'retur')
          AND t.tanggal_transaksi <= $1
        GROUP BY td.id_batch
      ),
      distribusi_keluar AS (
        SELECT 
          dd.id_batch,
          COALESCE(SUM(dd.jumlah), 0) as total_distribusi
        FROM distribusi_detail dd
        JOIN distribusi d ON d.id = dd.id_distribusi
        WHERE d.status = 'confirmed'
          AND d.tanggal_distribusi <= $1
        GROUP BY dd.id_batch
      )
      SELECT 
        bt.id as id_batch,
        b.id as id_barang,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        bt.nomor_batch,
        bt.harga_perolehan,
        bt.tanggal_kadaluarsa,
        0::BIGINT as saldo_awal,
        COALESCE(tm.total_masuk, 0)::BIGINT as total_masuk,
        (COALESCE(tk.total_keluar, 0) + COALESCE(dk.total_distribusi, 0))::BIGINT as total_keluar,
        (COALESCE(tm.total_masuk, 0) - COALESCE(tk.total_keluar, 0) - COALESCE(dk.total_distribusi, 0))::BIGINT as saldo_akhir
      FROM batch bt
      JOIN barang b ON b.id = bt.id_barang
      LEFT JOIN transaksi_masuk tm ON tm.id_batch = bt.id
      LEFT JOIN transaksi_keluar tk ON tk.id_batch = bt.id
      LEFT JOIN distribusi_keluar dk ON dk.id_batch = bt.id
      WHERE 1=1
    `;
    const params: any[] = [req.tanggal_cutoff];

    if (req.id_barang) {
      query += ` AND bt.id_barang = $2`;
      params.push(req.id_barang);
    }

    query += ` 
      HAVING (COALESCE(tm.total_masuk, 0) - COALESCE(tk.total_keluar, 0) - COALESCE(dk.total_distribusi, 0)) > 0
      ORDER BY b.nama_barang ASC, bt.tanggal_kadaluarsa ASC NULLS LAST
    `;

    const rows = await db.rawQueryAll<BukuBarangBatch>(query, ...params);
    return { items: rows };
  }
);
