<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Poli;
use App\Models\Obat;
use App\Models\TarifLayanan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users (Roles)
        $users = [
            [
                'nama' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
            ],
            [
                'nama' => 'Staff Pendaftaran',
                'username' => 'pendaftaran',
                'password' => Hash::make('pendaftaran123'),
                'role' => 'pendaftaran',
                'status' => 'active',
            ],
            [
                'nama' => 'dr. Andi Pratama',
                'username' => 'dokter',
                'password' => Hash::make('dokter123'),
                'role' => 'dokter',
                'status' => 'active',
            ],
            [
                'nama' => 'Rina Lestari, S.Farm, Apt',
                'username' => 'apoteker',
                'password' => Hash::make('apoteker123'),
                'role' => 'apoteker',
                'status' => 'active',
            ],
            [
                'nama' => 'Lia Lestari, A.Md.AK',
                'username' => 'laboran',
                'password' => Hash::make('laboran123'),
                'role' => 'laboran',
                'status' => 'active',
            ],
            [
                'nama' => 'Siti Rahma',
                'username' => 'kasir',
                'password' => Hash::make('kasir123'),
                'role' => 'kasir',
                'status' => 'active',
            ],
            [
                'nama' => 'Dr. Budi Santoso',
                'username' => 'kepala',
                'password' => Hash::make('kepala123'),
                'role' => 'kepala',
                'status' => 'active',
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['username' => $u['username']], $u);
        }

        // 2. Seed Polis
        $polis = [
            ['nama_poli' => 'Poli Umum', 'kode_poli' => 'UMM'],
            ['nama_poli' => 'Poli KIA (Ibu & Anak)', 'kode_poli' => 'KIA'],
            ['nama_poli' => 'Poli Gigi', 'kode_poli' => 'GIG'],
            ['nama_poli' => 'Poli Anak', 'kode_poli' => 'ANK'],
        ];

        foreach ($polis as $p) {
            Poli::updateOrCreate(['kode_poli' => $p['kode_poli']], $p);
        }

        // 3. Seed Obats
        $obats = [
            [
                'nama_obat' => 'Paracetamol 500mg',
                'satuan' => 'tablet',
                'stok' => 120,
                'harga' => 5000.00,
                'tgl_kadaluarsa' => '2028-12-31',
                'kategori' => 'Generik',
            ],
            [
                'nama_obat' => 'Amoxicillin 500mg',
                'satuan' => 'tablet',
                'stok' => 80,
                'harga' => 8000.00,
                'tgl_kadaluarsa' => '2027-10-15',
                'kategori' => 'Antibiotik',
            ],
            [
                'nama_obat' => 'Ibuprofen 400mg',
                'satuan' => 'tablet',
                'stok' => 150,
                'harga' => 6000.00,
                'tgl_kadaluarsa' => '2028-06-20',
                'kategori' => 'Generik',
            ],
            [
                'nama_obat' => 'Cetirizine 10mg',
                'satuan' => 'tablet',
                'stok' => 90,
                'harga' => 4000.00,
                'tgl_kadaluarsa' => '2027-05-30',
                'kategori' => 'Antihistamin',
            ],
            [
                'nama_obat' => 'OBH Syrup 100ml',
                'satuan' => 'botol',
                'stok' => 45,
                'harga' => 15000.00,
                'tgl_kadaluarsa' => '2027-08-12',
                'kategori' => 'Sirup',
            ],
            [
                'nama_obat' => 'Antasida Doen',
                'satuan' => 'tablet',
                'stok' => 200,
                'harga' => 3000.00,
                'tgl_kadaluarsa' => '2028-01-01',
                'kategori' => 'Generik',
            ],
        ];

        foreach ($obats as $o) {
            Obat::updateOrCreate(['nama_obat' => $o['nama_obat']], $o);
        }

        // 4. Seed Tarif Layanan
        $tarif = [
            ['nama_layanan' => 'Pemeriksaan Poli Umum / Konsultasi', 'harga' => 15000.00],
            ['nama_layanan' => 'Pemeriksaan Poli KIA / Konsultasi', 'harga' => 20000.00],
            ['nama_layanan' => 'Pemeriksaan Poli Gigi / Konsultasi', 'harga' => 25000.00],
            ['nama_layanan' => 'Tindakan Medis Ringan', 'harga' => 35000.00],
            ['nama_layanan' => 'Pembersihan Karang Gigi', 'harga' => 75000.00],
            ['nama_layanan' => 'Pemeriksaan Darah Lengkap (Lab)', 'harga' => 50000.00],
            ['nama_layanan' => 'Pemeriksaan Urine (Lab)', 'harga' => 30000.00],
            ['nama_layanan' => 'Pemeriksaan Gula Darah (Lab)', 'harga' => 20000.00],
        ];

        foreach ($tarif as $t) {
            TarifLayanan::updateOrCreate(['nama_layanan' => $t['nama_layanan']], $t);
        }
    }
}
