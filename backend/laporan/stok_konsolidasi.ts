import { api } from "encore.dev/api";
import db from "../db";

interface StokKonsolidasi {
  id_barang: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  total_stok: number;
  nilai_persediaan: number;
}

interface StokKonsolidasiResponse {
  items: StokKonsolidasi[];
}

// Retrieves consolidated stock per barang.
export const stokKonsolidasi = api<void, StokKonsolidasiResponse>(
  { expose: true, method: "GET", path: "/laporan/stok-konsolidasi" },
  async () => {
    const rows = await db.queryAll<StokKonsolidasi>`
      SELECT 
        b.id as id_barang,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        COALESCE(SUM(bt.stok_tersedia), 0)::BIGINT as total_stok,
        COALESCE(SUM(bt.stok_tersedia * bt.harga_perolehan), 0) as nilai_persediaan
      FROM barang b
      LEFT JOIN batch bt ON bt.id_barang = b.id
      GROUP BY b.id, b.kode_barang, b.nama_barang, b.satuan
      HAVING COALESCE(SUM(bt.stok_tersedia), 0) > 0
      ORDER BY b.nama_barang ASC
    `;
    return { items: rows };
  }
);
