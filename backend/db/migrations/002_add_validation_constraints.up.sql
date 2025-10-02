-- Add CHECK constraints to prevent negative values

-- Batch table constraints
ALTER TABLE batch ADD CONSTRAINT check_batch_stok_positive CHECK (stok_tersedia >= 0);
ALTER TABLE batch ADD CONSTRAINT check_batch_harga_positive CHECK (harga_perolehan >= 0);

-- Transaksi detail constraints
ALTER TABLE transaksi_detail ADD CONSTRAINT check_transaksi_jumlah_positive CHECK (jumlah > 0);
ALTER TABLE transaksi_detail ADD CONSTRAINT check_transaksi_harga_nonnegative CHECK (harga >= 0);

-- Distribusi detail constraints
ALTER TABLE distribusi_detail ADD CONSTRAINT check_distribusi_jumlah_positive CHECK (jumlah > 0);
