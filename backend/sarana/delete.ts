import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteSaranaRequest {
  id: number;
}

export const del = api<DeleteSaranaRequest, void>(
  { expose: true, method: "DELETE", path: "/sarana/:id" },
  async (req) => {
    const existing = await db.queryRow`
      SELECT id FROM sarana WHERE id = ${req.id}
    `;
    if (!existing) {
      throw APIError.notFound("sarana not found");
    }
    await db.exec`
      DELETE FROM sarana WHERE id = ${req.id}
    `;
  }
);
