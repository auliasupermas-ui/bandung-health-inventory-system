import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BatchPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_barang: "",
    nomor_batch: "",
    harga_perolehan: "",
    tanggal_kadaluarsa: "",
    stok_tersedia: "",
    catatan_penerimaan: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: barangData } = useQuery({
    queryKey: ["barang"],
    queryFn: () => backend.barang.list(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["batch"],
    queryFn: () => backend.batch.list({}),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.batch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batch"] });
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Batch berhasil ditambahkan" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal menambahkan batch", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      id_barang: "",
      nomor_batch: "",
      harga_perolehan: "",
      tanggal_kadaluarsa: "",
      stok_tersedia: "",
      catatan_penerimaan: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      id_barang: parseInt(formData.id_barang),
      nomor_batch: formData.nomor_batch || undefined,
      harga_perolehan: parseFloat(formData.harga_perolehan),
      tanggal_kadaluarsa: formData.tanggal_kadaluarsa
        ? new Date(formData.tanggal_kadaluarsa)
        : undefined,
      stok_tersedia: parseInt(formData.stok_tersedia),
      catatan_penerimaan: formData.catatan_penerimaan || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batch Barang</h2>
          <p className="text-sm text-muted-foreground">
            Kelola batch dengan harga dan tanggal kadaluarsa
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Batch Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="id_barang">Barang</Label>
                <Select
                  value={formData.id_barang}
                  onValueChange={(value) =>
                    setFormData({ ...formData, id_barang: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {barangData?.items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.nama_barang} ({item.kode_barang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomor_batch">Nomor Batch</Label>
                  <Input
                    id="nomor_batch"
                    value={formData.nomor_batch}
                    onChange={(e) =>
                      setFormData({ ...formData, nomor_batch: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="harga_perolehan">Harga Perolehan</Label>
                  <Input
                    id="harga_perolehan"
                    type="number"
                    step="0.01"
                    value={formData.harga_perolehan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        harga_perolehan: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tanggal_kadaluarsa">Tanggal Kadaluarsa</Label>
                  <Input
                    id="tanggal_kadaluarsa"
                    type="date"
                    value={formData.tanggal_kadaluarsa}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_kadaluarsa: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stok_tersedia">Stok Tersedia</Label>
                  <Input
                    id="stok_tersedia"
                    type="number"
                    value={formData.stok_tersedia}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stok_tersedia: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="catatan_penerimaan">Catatan Penerimaan</Label>
                <Input
                  id="catatan_penerimaan"
                  value={formData.catatan_penerimaan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      catatan_penerimaan: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Nomor Batch</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead>Kadaluarsa</TableHead>
              <TableHead className="text-right">Stok</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.nama_barang}
                  </TableCell>
                  <TableCell>{item.nomor_batch || "-"}</TableCell>
                  <TableCell className="text-right">
                    Rp {item.harga_perolehan.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    {item.tanggal_kadaluarsa
                      ? format(
                          new Date(item.tanggal_kadaluarsa),
                          "dd MMM yyyy",
                          { locale: id }
                        )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.stok_tersedia.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.catatan_penerimaan || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
