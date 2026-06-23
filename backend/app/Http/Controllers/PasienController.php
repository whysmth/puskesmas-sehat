<?php

namespace App\Http\Controllers;

use App\Models\Pasien;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PasienController extends Controller
{
    /**
     * Display a listing of patients.
     * Supports search query by nama, nik, or no_rm.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = Pasien::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('no_rm', 'like', "%{$search}%");
            });
        }

        $pasiens = $query->orderBy('no_rm', 'desc')->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $pasiens
        ]);
    }

    /**
     * Store a newly created patient in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:pasiens,nik',
            'nama' => 'required|string|max:255',
            'tgl_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
            'no_hp' => 'required|string|max:20',
            'jenis_pasien' => 'required|in:umum,bpjs',
            'no_bpjs' => 'required_if:jenis_pasien,bpjs|nullable|string|max:50',
        ], [
            'no_bpjs.required_if' => 'Nomor BPJS wajib diisi jika jenis pasien adalah BPJS.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Auto generate no_rm
        $lastPasien = Pasien::orderBy('id', 'desc')->first();
        if (!$lastPasien) {
            $no_rm = 'RM000001';
        } else {
            $num = (int) substr($lastPasien->no_rm, 2);
            $no_rm = 'RM' . str_pad($num + 1, 6, '0', STR_PAD_LEFT);
        }

        $pasienData = $request->all();
        $pasienData['no_rm'] = $no_rm;

        $pasien = Pasien::create($pasienData);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil disimpan.',
            'data' => $pasien
        ], 201);
    }

    /**
     * Display the specified patient.
     */
    public function show($id)
    {
        $pasien = Pasien::find($id);

        if (!$pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pasien tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pasien
        ]);
    }

    /**
     * Update the specified patient in storage.
     */
    public function update(Request $request, $id)
    {
        $pasien = Pasien::find($id);

        if (!$pasien) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pasien tidak ditemukan.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16|unique:pasiens,nik,' . $id,
            'nama' => 'required|string|max:255',
            'tgl_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:L,P',
            'alamat' => 'required|string',
            'no_hp' => 'required|string|max:20',
            'jenis_pasien' => 'required|in:umum,bpjs',
            'no_bpjs' => 'required_if:jenis_pasien,bpjs|nullable|string|max:50',
        ], [
            'no_bpjs.required_if' => 'Nomor BPJS wajib diisi jika jenis pasien adalah BPJS.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        $pasien->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data pasien berhasil diperbarui.',
            'data' => $pasien
        ]);
    }
}
