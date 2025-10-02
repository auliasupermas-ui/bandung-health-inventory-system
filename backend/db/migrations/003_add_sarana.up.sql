-- Master Data Sarana
CREATE TABLE sarana (
  id BIGSERIAL PRIMARY KEY,
  kode_sarana VARCHAR(50) UNIQUE NOT NULL,
  nama_sarana VARCHAR(200) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sarana fields to transaksi
ALTER TABLE transaksi ADD COLUMN id_sarana BIGINT REFERENCES sarana(id);
CREATE INDEX idx_transaksi_sarana ON transaksi(id_sarana);
