import { useState, useEffect } from "react";
import backend from "~backend/client";
import type { Sarana } from "~backend/sarana/list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function SaranaPage() {
  const [saranaList, setSaranaList] = useState<Sarana[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    kode_sarana: "",
    nama_sarana: "",
    alamat: "",
    telepon: "",
  });
  const { toast } = useToast();

  const fetchSarana = async () => {
    try {
      setLoading(true);
      const data = await backend.sarana.list();
      setSaranaList(data.items);
    } catch (error) {
      console.error("Error fetching sarana:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data sarana",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSarana();
  }, []);

  const handleOpenDialog = (sarana?: Sarana) => {
    if (sarana) {
      setEditingId(sarana.id);
      setFormData({
        kode_sarana: sarana.kode_sarana,
        nama_sarana: sarana.nama_sarana,
        alamat: sarana.alamat || "",
        telepon: sarana.telepon || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        kode_sarana: "",
        nama_sarana: "",
        alamat: "",
        telepon: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      kode_sarana: "",
      nama_sarana: "",
      alamat: "",
      telepon: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await backend.sarana.update({
          id: editingId,
          ...formData,
        });
        toast({
          title: "Berhasil",
          description: "Sarana berhasil diperbarui",
        });
      } else {
        await backend.sarana.create(formData);
        toast({
          title: "Berhasil",
          description: "Sarana berhasil ditambahkan",
        });
      }
      handleCloseDialog();
      fetchSarana();
    } catch (error) {
      console.error("Error saving sarana:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan sarana",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sarana ini?")) return;

    try {
      await backend.sarana.del({ id });
      toast({
        title: "Berhasil",
        description: "Sarana berhasil dihapus",
      });
      fetchSarana();
    } catch (error) {
      console.error("Error deleting sarana:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus sarana",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data Sarana</h1>
          <p className="text-muted-foreground">
            Kelola data sarana kesehatan
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sarana
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Sarana</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saranaList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Tidak ada data sarana
                  </TableCell>
                </TableRow>
              ) : (
                saranaList.map((sarana) => (
                  <TableRow key={sarana.id}>
                    <TableCell className="font-medium">{sarana.kode_sarana}</TableCell>
                    <TableCell>{sarana.nama_sarana}</TableCell>
                    <TableCell>{sarana.alamat || "-"}</TableCell>
                    <TableCell>{sarana.telepon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(sarana)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sarana.id)}
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
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Sarana" : "Tambah Sarana"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="kode_sarana">Kode Sarana</Label>
                <Input
                  id="kode_sarana"
                  value={formData.kode_sarana}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_sarana: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="nama_sarana">Nama Sarana</Label>
                <Input
                  id="nama_sarana"
                  value={formData.nama_sarana}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_sarana: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={formData.telepon}
                  onChange={(e) =>
                    setFormData({ ...formData, telepon: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
