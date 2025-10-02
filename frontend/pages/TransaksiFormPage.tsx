import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import SearchBarang from "@/components/barang/SearchBarang";
import type { BatchInfo } from "~backend/barang/search";
import type { Sarana } from "~backend/sarana/list";

interface DetailItem {
  id_batch: number;
  nama_barang: string;
  nomor_batch: string | null;
  satuan: string;
  jumlah: number;
  harga: number;
  stok_tersedia: number;
}

export default function TransaksiFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [jenis, setJenis] = useState<string>("penerimaan");
  const [tanggal, setTanggal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [idSarana, setIdSarana] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [details, setDetails] = useState<DetailItem[]>([]);
  const [saranaList, setSaranaList] = useState<Sarana[]>([]);

  useEffect(() => {
    backend.sarana.list().then(data => setSaranaList(data.items)).catch(console.error);
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.transaksi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      toast({ title: "Transaksi berhasil dibuat" });
      navigate("/transaksi");
    },
    onError: (error) => {
      console.error(error);
      toast({ title: "Gagal membuat transaksi", variant: "destructive" });
    },
  });

  const handleAddBatch = (
    nama_barang: string,
    satuan: string,
    batch: BatchInfo
  ) => {
    const exists = details.find((d) => d.id_batch === batch.id_batch);
    if (exists) {
      toast({
        title: "Batch sudah ditambahkan",
        variant: "destructive",
      });
      return;
    }

    setDetails([
      ...details,
      {
        id_batch: batch.id_batch,
        nama_barang,
        nomor_batch: batch.nomor_batch,
        satuan,
        jumlah: 0,
        harga: batch.harga_perolehan,
        stok_tersedia: batch.stok_tersedia,
      },
    ]);
  };

  const handleRemoveDetail = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleUpdateJumlah = (index: number, value: string) => {
    const newDetails = [...details];
    newDetails[index].jumlah = parseInt(value) || 0;
    setDetails(newDetails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (details.length === 0) {
      toast({
        title: "Tambahkan minimal satu barang",
        variant: "destructive",
      });
      return;
    }

    if (details.some((d) => d.jumlah <= 0)) {
      toast({
        title: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      jenis_transaksi: jenis,
      tanggal_transaksi: new Date(tanggal),
      id_sarana: idSarana ? parseInt(idSarana) : undefined,
      keterangan,
      details: details.map((d) => ({
        id_batch: d.id_batch,
        jumlah: d.jumlah,
        harga: d.harga,
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Transaksi Baru
          </h2>
          <p className="text-sm text-muted-foreground">
            Buat transaksi penerimaan, pengeluaran, atau retur
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jenis">Jenis Transaksi</Label>
              <Select value={jenis} onValueChange={setJenis}>
                <SelectTrigger id="jenis">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="penerimaan">Penerimaan</SelectItem>
                  <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                  <SelectItem value="retur">Retur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sarana">
                {jenis === "penerimaan" || jenis === "retur"
                  ? "Asal Penerimaan"
                  : "Tujuan Distribusi"}
              </Label>
              <Select value={idSarana} onValueChange={setIdSarana}>
                <SelectTrigger id="sarana">
                  <SelectValue placeholder="Pilih sarana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {saranaList.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.nama_sarana}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="keterangan">Keterangan</Label>
              <Input
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Detail Barang</h3>
            <SearchBarang onSelectBatch={handleAddBatch} />
          </div>

          {details.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tambahkan barang menggunakan tombol di atas
            </div>
          ) : (
            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-sm">
                    <th className="text-left p-3">Barang</th>
                    <th className="text-left p-3">Batch</th>
                    <th className="text-left p-3">Satuan</th>
                    <th className="text-right p-3">Stok</th>
                    <th className="text-right p-3">Harga</th>
                    <th className="text-right p-3">Jumlah</th>
                    <th className="text-right p-3">Total</th>
                    <th className="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{detail.nama_barang}</td>
                      <td className="p-3">{detail.nomor_batch || "-"}</td>
                      <td className="p-3">{detail.satuan}</td>
                      <td className="p-3 text-right">
                        {detail.stok_tersedia.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3 text-right">
                        Rp {detail.harga.toLocaleString("id-ID")}
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="1"
                          value={detail.jumlah || ""}
                          onChange={(e) =>
                            handleUpdateJumlah(index, e.target.value)
                          }
                          className="text-right w-24 ml-auto"
                        />
                      </td>
                      <td className="p-3 text-right font-medium">
                        Rp{" "}
                        {(detail.jumlah * detail.harga).toLocaleString(
                          "id-ID"
                        )}
                      </td>
                      <td className="p-3">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveDetail(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Simpan Draft
          </Button>
        </div>
      </form>
    </div>
  );
}
