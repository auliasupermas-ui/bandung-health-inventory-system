import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetTransaksiRequest {
  id: number;
}

interface TransaksiDetail {
  id: number;
  id_batch: number;
  nama_barang: string;
  nomor_batch: string | null;
  satuan: string;
  jumlah: number;
  harga: number;
}

interface Transaksi {
  id: number;
  nomor_transaksi: string;
  jenis_transaksi: string;
  tanggal_transaksi: Date;
  keterangan: string | null;
  status: string;
  created_by: string | null;
  created_at: Date;
  confirmed_at: Date | null;
  details: TransaksiDetail[];
}

// Retrieves a single transaction with all its details.
export const get = api<GetTransaksiRequest, Transaksi>(
  { expose: true, method: "GET", path: "/transaksi/:id" },
  async (req) => {
    const header = await db.queryRow<{
      id: number;
      nomor_transaksi: string;
      jenis_transaksi: string;
      tanggal_transaksi: Date;
      keterangan: string | null;
      status: string;
      created_by: string | null;
      created_at: Date;
      confirmed_at: Date | null;
    }>`
      SELECT 
        id, nomor_transaksi, jenis_transaksi, tanggal_transaksi,
        keterangan, status, created_by, created_at, confirmed_at
      FROM transaksi
      WHERE id = ${req.id}
    `;

    if (!header) {
      throw APIError.notFound("transaksi not found");
    }

    const details = await db.queryAll<TransaksiDetail>`
      SELECT 
        td.id,
        td.id_batch,
        b.nama_barang,
        bt.nomor_batch,
        b.satuan,
        td.jumlah,
        td.harga
      FROM transaksi_detail td
      JOIN batch bt ON bt.id = td.id_batch
      JOIN barang b ON b.id = bt.id_barang
      WHERE td.id_transaksi = ${req.id}
      ORDER BY td.id ASC
    `;

    return {
      ...header,
      details,
    };
  }
);
