import { api } from "encore.dev/api";
import db from "../db";

interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  total_stok: number;
}

interface ListBarangResponse {
  items: Barang[];
}

// Retrieves all barang with total stock from all batches.
export const list = api<void, ListBarangResponse>(
  { expose: true, method: "GET", path: "/barang" },
  async () => {
    const rows = await db.queryAll<Barang>`
      SELECT 
        b.id,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        COALESCE(SUM(bt.stok_tersedia), 0)::BIGINT as total_stok
      FROM barang b
      LEFT JOIN batch bt ON bt.id_barang = b.id
      GROUP BY b.id, b.kode_barang, b.nama_barang, b.satuan
      ORDER BY b.nama_barang ASC
    `;
    return { items: rows };
  }
);
