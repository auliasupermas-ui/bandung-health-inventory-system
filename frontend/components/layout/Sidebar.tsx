import { NavLink } from "react-router-dom";
import { Package, Layers, ArrowLeftRight, Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Master Barang", href: "/barang", icon: Package },
  { name: "Batch", href: "/batch", icon: Layers },
  { name: "Transaksi", href: "/transaksi", icon: ArrowLeftRight },
  { name: "Distribusi", href: "/distribusi", icon: Send },
  { name: "Laporan", href: "/laporan", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-card p-4">
      <nav className="space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
