import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function LaporanPage() {
  const [tanggalCutoff, setTanggalCutoff] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [hariKadaluarsa, setHariKadaluarsa] = useState<string>("150");

  // Untuk kartu stok
  const [selectedBarangId, setSelectedBarangId] = useState<string>("");
  const [barangList, setBarangList] = useState<
    { id: number; nama_barang: string; kode_barang: string }[]
  >([]);

  useEffect(() => {
    backend.barang.list().then((data) => {
      setBarangList(data.items || []);
    });
  }, []);

  const { data: kartuStok, isLoading: loadingKartuStok } = useQuery({
    queryKey: ["laporan", "kartu-stok", selectedBarangId],
    queryFn: () =>
      backend.laporan.kartuStok({
        id_barang: parseInt(selectedBarangId),
      }),
    enabled: !!selectedBarangId,
  });

  const { data: stokPerBatch, isLoading: loadingStokPerBatch } = useQuery({
    queryKey: ["laporan", "stok-per-batch"],
    queryFn: () => backend.laporan.stokPerBatch({}),
  });

  const { data: stokKonsolidasi, isLoading: loadingStokKonsolidasi } =
    useQuery({
      queryKey: ["laporan", "stok-konsolidasi"],
      queryFn: () => backend.laporan.stokKonsolidasi(),
    });

  const { data: bukuBarang, refetch: refetchBukuBarang } = useQuery({
    queryKey: ["laporan", "buku-barang", tanggalCutoff],
    queryFn: () =>
      backend.laporan.bukuBarang({
        tanggal_cutoff: new Date(tanggalCutoff),
      }),
    enabled: false,
  });

  const { data: kadaluarsa, refetch: refetchKadaluarsa } = useQuery({
    queryKey: ["laporan", "kadaluarsa", hariKadaluarsa],
    queryFn: () =>
      backend.laporan.kadaluarsa({
        hari: parseInt(hariKadaluarsa),
      }),
    enabled: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          Laporan stok, buku barang, kadaluarsa, dan kartu stok
        </p>
      </div>

      <Tabs defaultValue="stok-batch" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stok-batch">Stok per Batch</TabsTrigger>
          <TabsTrigger value="stok-konsolidasi">Stok Konsolidasi</TabsTrigger>
          <TabsTrigger value="buku-barang">Buku Barang</TabsTrigger>
          <TabsTrigger value="kadaluarsa">Kadaluarsa</TabsTrigger>
          <TabsTrigger value="kartu-stok">Kartu Stok</TabsTrigger>
        </TabsList>

        <TabsContent value="stok-batch" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead>Kadaluarsa</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStokPerBatch ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : stokPerBatch?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  stokPerBatch?.items.map((item) => (
                    <TableRow key={item.id_batch}>
                      <TableCell>{item.kode_barang}</TableCell>
                      <TableCell>{item.nama_barang}</TableCell>
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
                        {item.stok_tersedia.toLocaleString("id-ID")} {item.satuan}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {item.nilai_persediaan.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stok-konsolidasi" className="space-y-4">
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Total Stok</TableHead>
                  <TableHead className="text-right">Nilai Persediaan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStokKonsolidasi ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : stokKonsolidasi?.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                ) : (
                  stokKonsolidasi?.items.map((item) => (
                    <TableRow key={item.id_barang}>
                      <TableCell>{item.kode_barang}</TableCell>
                      <TableCell>{item.nama_barang}</TableCell>
                      <TableCell>{item.satuan}</TableCell>
                      <TableCell className="text-right">
                        {item.total_stok.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {item.nilai_persediaan.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="buku-barang" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="tanggal_cutoff">Tanggal Cut-off</Label>
                <Input
                  id="tanggal_cutoff"
                  type="date"
                  value={tanggalCutoff}
                  onChange={(e) => setTanggalCutoff(e.target.value)}
                />
              </div>
              <Button onClick={() => refetchBukuBarang()}>Tampilkan</Button>
            </div>
          </div>

          {bukuBarang && (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Saldo Awal</TableHead>
                    <TableHead className="text-right">Masuk</TableHead>
                    <TableHead className="text-right">Keluar</TableHead>
                    <TableHead className="text-right">Saldo Akhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bukuBarang.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    bukuBarang.items.map((item) => (
                      <TableRow key={item.id_batch}>
                        <TableCell>{item.kode_barang}</TableCell>
                        <TableCell>{item.nama_barang}</TableCell>
                        <TableCell>{item.nomor_batch || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.saldo_awal.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total_masuk.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total_keluar.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.saldo_akhir.toLocaleString("id-ID")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="kadaluarsa" className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="hari">Dalam (hari)</Label>
                <Input
                  id="hari"
                  type="number"
                  value={hariKadaluarsa}
                  onChange={(e) => setHariKadaluarsa(e.target.value)}
                />
              </div>
              <Button onClick={() => refetchKadaluarsa()}>Tampilkan</Button>
            </div>
          </div>

          {kadaluarsa && (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Kadaluarsa</TableHead>
                    <TableHead className="text-right">Hari Tersisa</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kadaluarsa.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    kadaluarsa.items.map((item) => (
                      <TableRow
                        key={item.id_batch}
                        className={
                          item.hari_tersisa < 30 ? "bg-red-50" : undefined
                        }
                      >
                        <TableCell>{item.kode_barang}</TableCell>
                        <TableCell>{item.nama_barang}</TableCell>
                        <TableCell>{item.nomor_batch || "-"}</TableCell>
                        <TableCell>
                          {format(
                            new Date(item.tanggal_kadaluarsa),
                            "dd MMM yyyy",
                            { locale: id }
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.hari_tersisa} hari
                        </TableCell>
                        <TableCell className="text-right">
                          {item.stok_tersedia.toLocaleString("id-ID")} {item.satuan}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* TAB BARU: Kartu Stok */}
        <TabsContent value="kartu-stok" className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <Label htmlFor="barang">Pilih Barang</Label>
              <select
                id="barang"
                className="border rounded px-2 py-1"
                value={selectedBarangId}
                onChange={(e) => setSelectedBarangId(e.target.value)}
              >
                <option value="">Pilih barang</option>
                {barangList.map((barang) => (
                  <option key={barang.id} value={barang.id.toString()}>
                    {barang.nama_barang} ({barang.kode_barang})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingKartuStok ? (
            <div>Loading...</div>
          ) : !selectedBarangId ? (
            <div className="py-8 text-muted-foreground text-center">
              Pilih barang terlebih dahulu
            </div>
          ) : kartuStok?.items?.length === 0 ? (
            <div className="py-8 text-muted-foreground text-center">
              Tidak ada transaksi untuk barang ini
            </div>
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nomor Transaksi</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Sisa Stok</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kartuStok.items.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell>
                        {format(new Date(trx.tanggal), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </TableCell>
                      <TableCell>{trx.nomor_transaksi}</TableCell>
                      <TableCell className="capitalize">{trx.jenis}</TableCell>
                      <TableCell className="text-right">{trx.jumlah}</TableCell>
                      <TableCell className="text-right">
                        {trx.sisa_stok}
                      </TableCell>
                      <TableCell>{trx.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
