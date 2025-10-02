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
