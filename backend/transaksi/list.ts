import { api, Query } from "encore.dev/api";
import db from "../db";

interface ListTransaksiRequest {
  jenis?: Query<string>;
  status?: Query<string>;
  dari_tanggal?: Query<Date>;
  sampai_tanggal?: Query<Date>;
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
}

interface ListTransaksiResponse {
  items: Transaksi[];
}

// Retrieves all transactions with optional filters.
export const list = api<ListTransaksiRequest, ListTransaksiResponse>(
  { expose: true, method: "GET", path: "/transaksi" },
  async (req) => {
    let query = `
      SELECT 
        id, nomor_transaksi, jenis_transaksi, tanggal_transaksi,
        keterangan, status, created_by, created_at, confirmed_at
      FROM transaksi
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (req.jenis) {
      query += ` AND jenis_transaksi = $${paramIndex}`;
      params.push(req.jenis);
      paramIndex++;
    }

    if (req.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(req.status);
      paramIndex++;
    }

    if (req.dari_tanggal) {
      query += ` AND tanggal_transaksi >= $${paramIndex}`;
      params.push(req.dari_tanggal);
      paramIndex++;
    }

    if (req.sampai_tanggal) {
      query += ` AND tanggal_transaksi <= $${paramIndex}`;
      params.push(req.sampai_tanggal);
      paramIndex++;
    }

    query += ` ORDER BY tanggal_transaksi DESC, created_at DESC`;

    const rows = await db.rawQueryAll<Transaksi>(query, ...params);
    return { items: rows };
  }
);
