-- Master Data Barang
CREATE TABLE barang (
  id BIGSERIAL PRIMARY KEY,
  kode_barang VARCHAR(50) UNIQUE NOT NULL,
  nama_barang VARCHAR(200) NOT NULL,
  satuan VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Batch per Barang
CREATE TABLE batch (
  id BIGSERIAL PRIMARY KEY,
  id_barang BIGINT NOT NULL REFERENCES barang(id) ON DELETE CASCADE,
  nomor_batch VARCHAR(100),
  harga_perolehan DOUBLE PRECISION NOT NULL,
  tanggal_kadaluarsa DATE,
  stok_tersedia BIGINT NOT NULL DEFAULT 0,
  catatan_penerimaan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_batch_barang ON batch(id_barang);
CREATE INDEX idx_batch_kadaluarsa ON batch(tanggal_kadaluarsa);

-- Header Transaksi
CREATE TABLE transaksi (
  id BIGSERIAL PRIMARY KEY,
  nomor_transaksi VARCHAR(50) UNIQUE NOT NULL,
  jenis_transaksi VARCHAR(20) NOT NULL CHECK (jenis_transaksi IN ('penerimaan', 'pengeluaran', 'retur')),
  tanggal_transaksi DATE NOT NULL,
  keterangan TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed')),
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_transaksi_tanggal ON transaksi(tanggal_transaksi);
CREATE INDEX idx_transaksi_status ON transaksi(status);

-- Detail Transaksi per Batch
CREATE TABLE transaksi_detail (
  id BIGSERIAL PRIMARY KEY,
  id_transaksi BIGINT NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
  id_batch BIGINT NOT NULL REFERENCES batch(id),
  jumlah BIGINT NOT NULL,
  harga DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_transaksi_detail_transaksi ON transaksi_detail(id_transaksi);
CREATE INDEX idx_transaksi_detail_batch ON transaksi_detail(id_batch);

-- Distribusi/Alokasi
CREATE TABLE distribusi (
  id BIGSERIAL PRIMARY KEY,
  nomor_distribusi VARCHAR(50) UNIQUE NOT NULL,
  tanggal_distribusi DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed')),
  keterangan TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP
);

-- Detail Distribusi
CREATE TABLE distribusi_detail (
  id BIGSERIAL PRIMARY KEY,
  id_distribusi BIGINT NOT NULL REFERENCES distribusi(id) ON DELETE CASCADE,
  id_batch BIGINT NOT NULL REFERENCES batch(id),
  tujuan VARCHAR(200) NOT NULL,
  jumlah BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa
CREATE INDEX idx_distribusi_detail_distribusi ON distribusi_detail(id_distribusi);
CREATE INDEX idx_distribusi_detail_batch ON distribusi_detail(id_batch);
