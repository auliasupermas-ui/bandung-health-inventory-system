import { api, Query } from "encore.dev/api";
import db from "../db";

interface SearchBarangRequest {
  q: Query<string>;
}

export interface BatchInfo {
  id_batch: number;
  nomor_batch: string | null;
  harga_perolehan: number;
  tanggal_kadaluarsa: Date | null;
  stok_tersedia: number;
}

interface BarangWithBatches {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  batches: BatchInfo[];
}

interface SearchBarangResponse {
  items: BarangWithBatches[];
}

// Searches barang by name and returns available batches.
export const search = api<SearchBarangRequest, SearchBarangResponse>(
  { expose: true, method: "GET", path: "/barang/search" },
  async (req) => {
    const searchTerm = `%${req.q}%`;
    
    const rows = await db.queryAll<{
      id: number;
      kode_barang: string;
      nama_barang: string;
      satuan: string;
      id_batch: number | null;
      nomor_batch: string | null;
      harga_perolehan: number | null;
      tanggal_kadaluarsa: Date | null;
      stok_tersedia: number | null;
    }>`
      SELECT 
        b.id,
        b.kode_barang,
        b.nama_barang,
        b.satuan,
        bt.id as id_batch,
        bt.nomor_batch,
        bt.harga_perolehan,
        bt.tanggal_kadaluarsa,
        bt.stok_tersedia
      FROM barang b
      LEFT JOIN batch bt ON bt.id_barang = b.id AND bt.stok_tersedia > 0
      WHERE b.nama_barang ILIKE ${searchTerm} OR b.kode_barang ILIKE ${searchTerm}
      ORDER BY b.nama_barang ASC, bt.tanggal_kadaluarsa ASC NULLS LAST
      LIMIT 20
    `;

    const grouped = new Map<number, BarangWithBatches>();
    
    for (const row of rows) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          kode_barang: row.kode_barang,
          nama_barang: row.nama_barang,
          satuan: row.satuan,
          batches: [],
        });
      }
      
      const barang = grouped.get(row.id)!;
      if (row.id_batch !== null) {
        barang.batches.push({
          id_batch: row.id_batch,
          nomor_batch: row.nomor_batch,
          harga_perolehan: row.harga_perolehan!,
          tanggal_kadaluarsa: row.tanggal_kadaluarsa,
          stok_tersedia: row.stok_tersedia!,
        });
      }
    }

    return { items: Array.from(grouped.values()) };
  }
);
