import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetDistribusiRequest {
  id: number;
}

interface DistribusiDetail {
  id: number;
  id_batch: number;
  nama_barang: string;
  nomor_batch: string | null;
  satuan: string;
  tujuan: string;
  jumlah: number;
}

interface Distribusi {
  id: number;
  nomor_distribusi: string;
  tanggal_distribusi: Date;
  status: string;
  keterangan: string | null;
  created_by: string | null;
  created_at: Date;
  confirmed_at: Date | null;
  details: DistribusiDetail[];
}

// Retrieves a single distribution with all its details.
export const get = api<GetDistribusiRequest, Distribusi>(
  { expose: true, method: "GET", path: "/distribusi/:id" },
  async (req) => {
    const header = await db.queryRow<{
      id: number;
      nomor_distribusi: string;
      tanggal_distribusi: Date;
      status: string;
      keterangan: string | null;
      created_by: string | null;
      created_at: Date;
      confirmed_at: Date | null;
    }>`
      SELECT 
        id, nomor_distribusi, tanggal_distribusi, status,
        keterangan, created_by, created_at, confirmed_at
      FROM distribusi
      WHERE id = ${req.id}
    `;

    if (!header) {
      throw APIError.notFound("distribusi not found");
    }

    const details = await db.queryAll<DistribusiDetail>`
      SELECT 
        dd.id,
        dd.id_batch,
        b.nama_barang,
        bt.nomor_batch,
        b.satuan,
        dd.tujuan,
        dd.jumlah
      FROM distribusi_detail dd
      JOIN batch bt ON bt.id = dd.id_batch
      JOIN barang b ON b.id = bt.id_barang
      WHERE dd.id_distribusi = ${req.id}
      ORDER BY dd.id ASC
    `;

    return {
      ...header,
      details,
    };
  }
);
