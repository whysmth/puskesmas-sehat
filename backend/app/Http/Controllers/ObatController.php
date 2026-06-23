<?php

namespace App\Http\Controllers;

use App\Models\Obat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ObatController extends Controller
{
    /**
     * Display a listing of medicines.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $kategori = $request->query('kategori');

        $query = Obat::query();

        if ($search) {
            $query->where('nama_obat', 'like', "%{$search}%");
        }

        if ($kategori) {
            $query->where('kategori', $kategori);
        }

        $obats = $query->orderBy('nama_obat', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $obats
        ]);
    }

    /**
     * Store a newly created medicine.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_obat' => 'required|string|max:255|unique:obats,nama_obat',
            'satuan' => 'required|string|max:50',
            'stok' => 'required|integer|min:0',
            'harga' => 'required|numeric|min:0',
            'tgl_kadaluarsa' => 'required|date',
            'kategori' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $obat = Obat::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Obat berhasil ditambahkan.',
            'data' => $obat
        ], 201);
    }

    /**
     * Display the specified medicine.
     */
    public function show($id)
    {
        $obat = Obat::find($id);

        if (!$obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data obat tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $obat
        ]);
    }

    /**
     * Update the specified medicine.
     */
    public function update(Request $request, $id)
    {
        $obat = Obat::find($id);

        if (!$obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data obat tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_obat' => 'required|string|max:255|unique:obats,nama_obat,' . $id,
            'satuan' => 'required|string|max:50',
            'stok' => 'required|integer|min:0',
            'harga' => 'required|numeric|min:0',
            'tgl_kadaluarsa' => 'required|date',
            'kategori' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $obat->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data obat berhasil diperbarui.',
            'data' => $obat
        ]);
    }

    /**
     * Replenish/Update stock of a medicine.
     */
    public function updateStok(Request $request, $id)
    {
        $obat = Obat::find($id);

        if (!$obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data obat tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'stok' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jumlah stok tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        $obat->stok = $request->stok;
        $obat->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Stok obat berhasil diperbarui.',
            'data' => $obat
        ]);
    }

    /**
     * Remove the specified medicine.
     */
    public function destroy($id)
    {
        $obat = Obat::find($id);

        if (!$obat) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data obat tidak ditemukan.'
            ], 404);
        }

        $obat->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Obat berhasil dihapus.'
        ]);
    }
}
