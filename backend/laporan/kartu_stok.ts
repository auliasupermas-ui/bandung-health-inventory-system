import { api, Query } from "encore.dev/api";
import db from "../db";

interface KartuStokRequest {
  id_barang: Query<number>;
}

interface KartuStokItem {
  id: number;
  tanggal: Date;
  nomor_transaksi: string;
  jenis: string;
  jumlah: number;
  sisa_stok: number;
  keterangan: string | null;
}

interface KartuStokResponse {
  items: KartuStokItem[];
}

// Returns all transactions for a specific item, sorted by date.
export const kartuStok = api<KartuStokRequest, KartuStokResponse>(
  { expose: true, method: "GET", path: "/laporan/kartu-stok" },
  async ({ id_barang }) => {
    // Ambil histori transaksi barang
    const rows = await db.queryAll<KartuStokItem>`,
      SELECT
        td.id,
        t.tanggal_transaksi AS tanggal,
        t.nomor_transaksi,
        t.jenis_transaksi AS jenis,
        td.jumlah,
        td.sisa_stok,
        t.keterangan
      FROM transaksi_detail td
      JOIN transaksi t ON t.id = td.id_transaksi
      WHERE td.id_barang = ${id_barang}
      ORDER BY t.tanggal_transaksi ASC, td.id ASC
    `;
    return { items: rows };
  }
);