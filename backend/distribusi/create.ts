import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DistribusiDetailInput {
  id_batch: number;
  tujuan: string;
  jumlah: number;
}

interface CreateDistribusiRequest {
  tanggal_distribusi: Date;
  keterangan?: string;
  created_by?: string;
  details: DistribusiDetailInput[];
}

interface Distribusi {
  id: number;
  nomor_distribusi: string;
  tanggal_distribusi: Date;
  status: string;
}

// Creates a new distribution allocation in draft status.
export const create = api<CreateDistribusiRequest, Distribusi>(
  { expose: true, method: "POST", path: "/distribusi" },
  async (req) => {
    if (req.details.length === 0) {
      throw APIError.invalidArgument("Distribution must have at least one detail item");
    }

    for (const detail of req.details) {
      if (detail.jumlah <= 0) {
        throw APIError.invalidArgument(`Quantity must be greater than zero for batch ${detail.id_batch}`);
      }

      if (!detail.tujuan || detail.tujuan.trim() === "") {
        throw APIError.invalidArgument(`Destination is required for batch ${detail.id_batch}`);
      }
    }

    await using tx = await db.begin();

    const nomorDistribusi = `DIST-${Date.now()}`;

    const distribusi = await tx.queryRow<Distribusi>`
      INSERT INTO distribusi (
        nomor_distribusi, tanggal_distribusi, keterangan, created_by, status
      )
      VALUES (
        ${nomorDistribusi},
        ${req.tanggal_distribusi},
        ${req.keterangan ?? null},
        ${req.created_by ?? null},
        'draft'
      )
      RETURNING id, nomor_distribusi, tanggal_distribusi, status
    `;

    if (!distribusi) {
      throw new Error("Failed to create distribusi");
    }

    for (const detail of req.details) {
      await tx.exec`
        INSERT INTO distribusi_detail (id_distribusi, id_batch, tujuan, jumlah)
        VALUES (${distribusi.id}, ${detail.id_batch}, ${detail.tujuan}, ${detail.jumlah})
      `;
    }

    await tx.commit();
    return distribusi;
  }
);
