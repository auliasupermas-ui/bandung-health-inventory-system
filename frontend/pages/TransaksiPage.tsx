import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, CheckCircle, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TransaksiPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["transaksi"],
    queryFn: () => backend.transaksi.list({}),
  });

  const { data: detailData } = useQuery({
    queryKey: ["transaksi", selectedId],
    queryFn: () => backend.transaksi.get({ id: selectedId! }),
    enabled: !!selectedId,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => backend.transaksi.confirm({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["batch"] });
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      toast({ title: "Transaksi berhasil dikonfirmasi" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal konfirmasi transaksi", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.transaksi.deleteTransaksi({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      toast({ title: "Transaksi berhasil dihapus" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal menghapus transaksi", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaksi</h2>
          <p className="text-sm text-muted-foreground">
            Kelola penerimaan, pengeluaran, dan retur barang
          </p>
        </div>
        <Button onClick={() => navigate("/transaksi/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Transaksi Baru
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Sarana</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.nomor_transaksi}
                  </TableCell>
                  <TableCell className="capitalize">
                    {item.jenis_transaksi}
                  </TableCell>
                  <TableCell>
                    {format(new Date(item.tanggal_transaksi), "dd MMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{item.nama_sarana || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === "confirmed" ? "default" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.keterangan || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedId(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status === "draft" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => confirmMutation.mutate(item.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nomor:</span>{" "}
                  {detailData.nomor_transaksi}
                </div>
                <div>
                  <span className="font-medium">Jenis:</span>{" "}
                  {detailData.jenis_transaksi}
                </div>
                <div>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {format(
                    new Date(detailData.tanggal_transaksi),
                    "dd MMMM yyyy",
                    { locale: id }
                  )}
                </div>
                <div>
                  <span className="font-medium">
                    {detailData.jenis_transaksi === "penerimaan" || detailData.jenis_transaksi === "retur"
                      ? "Asal Penerimaan:"
                      : "Tujuan Distribusi:"}
                  </span>{" "}
                  {detailData.nama_sarana || "-"}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge
                    variant={
                      detailData.status === "confirmed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {detailData.status}
                  </Badge>
                </div>
                {detailData.keterangan && (
                  <div className="col-span-2">
                    <span className="font-medium">Keterangan:</span>{" "}
                    {detailData.keterangan}
                  </div>
                )}
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barang</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailData.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.nama_barang}</TableCell>
                        <TableCell>{detail.nomor_batch || "-"}</TableCell>
                        <TableCell className="text-right">
                          {detail.jumlah} {detail.satuan}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {detail.harga.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp{" "}
                          {(detail.jumlah * detail.harga).toLocaleString(
                            "id-ID"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
