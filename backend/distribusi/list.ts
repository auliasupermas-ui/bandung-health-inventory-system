import { api } from "encore.dev/api";
import db from "../db";

interface Distribusi {
  id: number;
  nomor_distribusi: string;
  tanggal_distribusi: Date;
  status: string;
  keterangan: string | null;
  created_by: string | null;
  created_at: Date;
  confirmed_at: Date | null;
}

interface ListDistribusiResponse {
  items: Distribusi[];
}

// Retrieves all distribution allocations.
export const list = api<void, ListDistribusiResponse>(
  { expose: true, method: "GET", path: "/distribusi" },
  async () => {
    const rows = await db.queryAll<Distribusi>`
      SELECT 
        id, nomor_distribusi, tanggal_distribusi, status,
        keterangan, created_by, created_at, confirmed_at
      FROM distribusi
      ORDER BY tanggal_distribusi DESC, created_at DESC
    `;
    return { items: rows };
  }
);
