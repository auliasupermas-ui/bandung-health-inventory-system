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
import { Plus, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DistribusiPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["distribusi"],
    queryFn: () => backend.distribusi.list(),
  });

  const { data: detailData } = useQuery({
    queryKey: ["distribusi", selectedId],
    queryFn: () => backend.distribusi.get({ id: selectedId! }),
    enabled: !!selectedId,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => backend.distribusi.confirm({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distribusi"] });
      queryClient.invalidateQueries({ queryKey: ["batch"] });
      toast({ title: "Distribusi berhasil dikonfirmasi" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal konfirmasi distribusi", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Distribusi</h2>
          <p className="text-sm text-muted-foreground">
            Kelola alokasi distribusi barang ke berbagai tujuan
          </p>
        </div>
        <Button onClick={() => navigate("/distribusi/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Distribusi Baru
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.nomor_distribusi}
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(item.tanggal_distribusi),
                      "dd MMM yyyy",
                      { locale: id }
                    )}
                  </TableCell>
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
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => confirmMutation.mutate(item.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>Detail Distribusi</DialogTitle>
          </DialogHeader>
          {detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nomor:</span>{" "}
                  {detailData.nomor_distribusi}
                </div>
                <div>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {format(
                    new Date(detailData.tanggal_distribusi),
                    "dd MMMM yyyy",
                    { locale: id }
                  )}
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
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barang</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailData.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.nama_barang}</TableCell>
                        <TableCell>{detail.nomor_batch || "-"}</TableCell>
                        <TableCell>{detail.tujuan}</TableCell>
                        <TableCell className="text-right">
                          {detail.jumlah} {detail.satuan}
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
