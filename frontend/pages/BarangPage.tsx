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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function BarangPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    satuan: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["barang"],
    queryFn: async () => backend.barang.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => backend.barang.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Barang berhasil ditambahkan" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal menambahkan barang", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData & { id: number }) =>
      backend.barang.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Barang berhasil diperbarui" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal memperbarui barang", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.barang.deleteBarang({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barang"] });
      toast({ title: "Barang berhasil dihapus" });
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal menghapus barang", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ kode_barang: "", nama_barang: "", satuan: "" });
    setEditingId(null);
  };

  const handleEdit = (item: any) => {
    setFormData({
      kode_barang: item.kode_barang,
      nama_barang: item.nama_barang,
      satuan: item.satuan,
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Master Barang</h2>
          <p className="text-sm text-muted-foreground">
            Kelola data obat, vaksin, dan alat kesehatan
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
              Tambah Barang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Barang" : "Tambah Barang"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="kode_barang">Kode Barang</Label>
                <Input
                  id="kode_barang"
                  value={formData.kode_barang}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_barang: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="nama_barang">Nama Barang</Label>
                <Input
                  id="nama_barang"
                  value={formData.nama_barang}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_barang: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="satuan">Satuan</Label>
                <Input
                  id="satuan"
                  value={formData.satuan}
                  onChange={(e) =>
                    setFormData({ ...formData, satuan: e.target.value })
                  }
                  required
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
              <TableHead>Kode Barang</TableHead>
              <TableHead>Nama Barang</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead className="text-right">Total Stok</TableHead>
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
                    {item.kode_barang}
                  </TableCell>
                  <TableCell>{item.nama_barang}</TableCell>
                  <TableCell>{item.satuan}</TableCell>
                  <TableCell className="text-right">
                    {item.total_stok.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
