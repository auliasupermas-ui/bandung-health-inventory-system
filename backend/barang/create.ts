import { api } from "encore.dev/api";
import db from "../db";

interface CreateBarangRequest {
  kode_barang: string;
  nama_barang: string;
  satuan: string;
}

interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
}

// Creates a new barang.
export const create = api<CreateBarangRequest, Barang>(
  { expose: true, method: "POST", path: "/barang" },
  async (req) => {
    const row = await db.queryRow<Barang>`
      INSERT INTO barang (kode_barang, nama_barang, satuan)
      VALUES (${req.kode_barang}, ${req.nama_barang}, ${req.satuan})
      RETURNING id, kode_barang, nama_barang, satuan
    `;
    return row!;
  }
);
