import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import BarangPage from "@/pages/BarangPage";
import BatchPage from "@/pages/BatchPage";
import TransaksiPage from "@/pages/TransaksiPage";
import TransaksiFormPage from "@/pages/TransaksiFormPage";
import DistribusiPage from "@/pages/DistribusiPage";
import DistribusiFormPage from "@/pages/DistribusiFormPage";
import LaporanPage from "@/pages/LaporanPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/barang" replace />} />
            <Route path="barang" element={<BarangPage />} />
            <Route path="batch" element={<BatchPage />} />
            <Route path="transaksi" element={<TransaksiPage />} />
            <Route path="transaksi/new" element={<TransaksiFormPage />} />
            <Route path="distribusi" element={<DistribusiPage />} />
            <Route path="distribusi/new" element={<DistribusiFormPage />} />
            <Route path="laporan" element={<LaporanPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}
