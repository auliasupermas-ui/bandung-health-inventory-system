import { api } from "encore.dev/api";
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
