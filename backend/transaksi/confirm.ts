import { api, APIError } from "encore.dev/api";
import db from "../db";

interface ConfirmTransaksiRequest {
  id: number;
}

interface Transaksi {
  id: number;
  nomor_transaksi: string;
  status: string;
}

// Confirms a draft transaction and updates stock.
export const confirm = api<ConfirmTransaksiRequest, Transaksi>(
  { expose: true, method: "POST", path: "/transaksi/:id/confirm" },
  async (req) => {
    await using tx = await db.begin();

    const transaksi = await tx.queryRow<{
      id: number;
      nomor_transaksi: string;
      jenis_transaksi: string;
      status: string;
    }>`
      SELECT id, nomor_transaksi, jenis_transaksi, status
      FROM transaksi
      WHERE id = ${req.id}
      FOR UPDATE
    `;

    if (!transaksi) {
      throw APIError.notFound("transaksi not found");
    }

    if (transaksi.status !== "draft") {
      throw APIError.failedPrecondition("transaksi already confirmed");
    }

    const details = await tx.queryAll<{
      id_batch: number;
      jumlah: number;
    }>`
      SELECT id_batch, jumlah
      FROM transaksi_detail
      WHERE id_transaksi = ${req.id}
    `;

    for (const detail of details) {
      if (transaksi.jenis_transaksi === "penerimaan") {
        await tx.exec`
          UPDATE batch
          SET stok_tersedia = stok_tersedia + ${detail.jumlah}
          WHERE id = ${detail.id_batch}
        `;
      } else if (transaksi.jenis_transaksi === "pengeluaran" || transaksi.jenis_transaksi === "retur") {
        const batch = await tx.queryRow<{ 
          stok_tersedia: number;
          nomor_batch: string | null;
        }>`
          SELECT stok_tersedia, nomor_batch
          FROM batch
          WHERE id = ${detail.id_batch}
          FOR UPDATE
        `;

        if (!batch) {
          throw APIError.notFound(`Batch ${detail.id_batch} not found`);
        }

        if (batch.stok_tersedia < detail.jumlah) {
          const batchName = batch.nomor_batch || `ID ${detail.id_batch}`;
          throw APIError.failedPrecondition(
            `Insufficient stock for batch ${batchName}. Available: ${batch.stok_tersedia}, Required: ${detail.jumlah}`
          );
        }

        await tx.exec`
          UPDATE batch
          SET stok_tersedia = stok_tersedia - ${detail.jumlah}
          WHERE id = ${detail.id_batch}
        `;
      }
    }

    await tx.exec`
      UPDATE transaksi
      SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return {
      id: transaksi.id,
      nomor_transaksi: transaksi.nomor_transaksi,
      status: "confirmed",
    };
  }
);
