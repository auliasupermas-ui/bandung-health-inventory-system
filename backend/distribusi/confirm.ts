import { api, APIError } from "encore.dev/api";
import db from "../db";

interface ConfirmDistribusiRequest {
  id: number;
}

interface Distribusi {
  id: number;
  nomor_distribusi: string;
  status: string;
}

// Confirms a draft distribution and reduces stock.
export const confirm = api<ConfirmDistribusiRequest, Distribusi>(
  { expose: true, method: "POST", path: "/distribusi/:id/confirm" },
  async (req) => {
    await using tx = await db.begin();

    const distribusi = await tx.queryRow<{
      id: number;
      nomor_distribusi: string;
      status: string;
    }>`
      SELECT id, nomor_distribusi, status
      FROM distribusi
      WHERE id = ${req.id}
      FOR UPDATE
    `;

    if (!distribusi) {
      throw APIError.notFound("distribusi not found");
    }

    if (distribusi.status !== "draft") {
      throw APIError.failedPrecondition("distribusi already confirmed");
    }

    const details = await tx.queryAll<{
      id_batch: number;
      jumlah: number;
    }>`
      SELECT id_batch, jumlah
      FROM distribusi_detail
      WHERE id_distribusi = ${req.id}
    `;

    for (const detail of details) {
      const batch = await tx.queryRow<{ stok_tersedia: number }>`
        SELECT stok_tersedia
        FROM batch
        WHERE id = ${detail.id_batch}
      `;

      if (!batch || batch.stok_tersedia < detail.jumlah) {
        throw APIError.failedPrecondition(`insufficient stock for batch ${detail.id_batch}`);
      }

      await tx.exec`
        UPDATE batch
        SET stok_tersedia = stok_tersedia - ${detail.jumlah}
        WHERE id = ${detail.id_batch}
      `;
    }

    await tx.exec`
      UPDATE distribusi
      SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
    `;

    await tx.commit();

    return {
      id: distribusi.id,
      nomor_distribusi: distribusi.nomor_distribusi,
      status: "confirmed",
    };
  }
);
