import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteTransaksiRequest {
  id: number;
}

// Deletes a draft transaction.
export const deleteTransaksi = api<DeleteTransaksiRequest, void>(
  { expose: true, method: "DELETE", path: "/transaksi/:id" },
  async (req) => {
    const transaksi = await db.queryRow<{ status: string }>`
      SELECT status FROM transaksi WHERE id = ${req.id}
    `;

    if (!transaksi) {
      throw APIError.notFound("transaksi not found");
    }

    if (transaksi.status !== "draft") {
      throw APIError.failedPrecondition("cannot delete confirmed transaction");
    }

    await db.exec`DELETE FROM transaksi WHERE id = ${req.id}`;
  }
);
