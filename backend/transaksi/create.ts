import { api, APIError } from "encore.dev/api";
import db from "../db";

interface TransaksiDetailInput {
  id_batch: number;
  jumlah: number;
  harga: number;
}

interface CreateTransaksiRequest {
  jenis_transaksi: string;
  tanggal_transaksi: Date;
  id_sarana?: number;
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
    if (req.details.length === 0) {
      throw APIError.invalidArgument("Transaction must have at least one detail item");
    }

    for (const detail of req.details) {
      if (detail.jumlah <= 0) {
        throw APIError.invalidArgument(`Quantity must be greater than zero for batch ${detail.id_batch}`);
      }

      if (detail.harga < 0) {
        throw APIError.invalidArgument(`Price cannot be negative for batch ${detail.id_batch}`);
      }
    }

    await using tx = await db.begin();

    const nomorTransaksi = `TRX-${Date.now()}`;

    const transaksi = await tx.queryRow<Transaksi>`
      INSERT INTO transaksi (
        nomor_transaksi, jenis_transaksi, tanggal_transaksi,
        id_sarana, keterangan, created_by, status
      )
      VALUES (
        ${nomorTransaksi},
        ${req.jenis_transaksi},
        ${req.tanggal_transaksi},
        ${req.id_sarana ?? null},
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
