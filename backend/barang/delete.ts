import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteBarangRequest {
  id: number;
}

// Deletes a barang and all its batches.
export const deleteBarang = api<DeleteBarangRequest, void>(
  { expose: true, method: "DELETE", path: "/barang/:id" },
  async (req) => {
    await db.exec`
      DELETE FROM barang WHERE id = ${req.id}
    `;
  }
);
