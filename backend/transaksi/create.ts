import { api } from "encore.dev/api";
import db from "../db";

interface TransaksiDetailInput {
  id_batch: number;
  jumlah: number;
  harga: number;
}

interface CreateTransaksiRequest {
  jenis_transaksi: string;
  tanggal_transaksi: Date;
  keterangan?: string;
  created_by?: string;
  details: TransaksiDetailInput[];
}

interface Transaksi {
  id: number;
  nomor_transaksi: string;
  jenis_transaksi: string;
  tanggal_transaksi: Date;
  status: string;
}

// Creates a new transaction in draft status.
export const create = api<CreateTransaksiRequest, Transaksi>(
  { expose: true, method: "POST", path: "/transaksi" },
  async (req) => {
    await using tx = await db.begin();

    const nomorTransaksi = `TRX-${Date.now()}`;

    const transaksi = await tx.queryRow<Transaksi>`
      INSERT INTO transaksi (
        nomor_transaksi, jenis_transaksi, tanggal_transaksi,
        keterangan, created_by, status
      )
      VALUES (
        ${nomorTransaksi},
        ${req.jenis_transaksi},
        ${req.tanggal_transaksi},
        ${req.keterangan ?? null},
        ${req.created_by ?? null},
        'draft'
      )
      RETURNING id, nomor_transaksi, jenis_transaksi, tanggal_transaksi, status
    `;

    if (!transaksi) {
      throw new Error("Failed to create transaksi");
    }

    for (const detail of req.details) {
      await tx.exec`
        INSERT INTO transaksi_detail (id_transaksi, id_batch, jumlah, harga)
        VALUES (${transaksi.id}, ${detail.id_batch}, ${detail.jumlah}, ${detail.harga})
      `;
    }

    await tx.commit();
    return transaksi;
  }
);
