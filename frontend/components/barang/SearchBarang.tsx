import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { BatchInfo } from "~backend/barang/search";

interface SearchBarangProps {
  onSelectBatch: (
    namaBarang: string,
    satuan: string,
    batch: BatchInfo
  ) => void;
}

export default function SearchBarang({ onSelectBatch }: SearchBarangProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["barang-search", search],
    queryFn: () => backend.barang.search({ q: search }),
    enabled: search.length >= 2,
  });

  const handleSelect = (
    namaBarang: string,
    satuan: string,
    batch: BatchInfo
  ) => {
    onSelectBatch(namaBarang, satuan, batch);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Cari Barang
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="end">
        <div className="p-3 border-b">
          <Input
            placeholder="Ketik nama atau kode barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {search.length < 2
                ? "Ketik minimal 2 karakter"
                : "Tidak ada hasil"}
            </div>
          ) : (
            <div className="divide-y">
              {data.items.map((item) => (
                <div key={item.id} className="p-3">
                  <div className="font-medium text-sm mb-2">
                    {item.nama_barang} ({item.kode_barang})
                  </div>
                  {item.batches.length === 0 ? (
                    <div className="text-sm text-muted-foreground pl-4">
                      Tidak ada batch tersedia
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {item.batches.map((batch) => (
                        <button
                          key={batch.id_batch}
                          onClick={() =>
                            handleSelect(item.nama_barang, item.satuan, batch)
                          }
                          className="w-full text-left p-2 text-xs rounded hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Batch #{batch.nomor_batch || batch.id_batch}
                            </span>
                            <span className="text-muted-foreground">
                              Stok: {batch.stok_tersedia.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-muted-foreground mt-1">
                            <span>
                              Harga: Rp{" "}
                              {batch.harga_perolehan.toLocaleString("id-ID")}
                            </span>
                            {batch.tanggal_kadaluarsa && (
                              <span>
                                Kadaluarsa:{" "}
                                {format(
                                  new Date(batch.tanggal_kadaluarsa),
                                  "dd-MM-yyyy",
                                  { locale: id }
                                )}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
