import { Package } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-card">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Sistem Gudang Obat</h1>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          Dinas Kesehatan Kota Bandung
        </div>
      </div>
    </header>
  );
}
