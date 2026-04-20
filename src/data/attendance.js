// ===== DATABASE: ATTENDANCE MANAGEMENT =====
// Menyimpan dan mengelola data absensi kegiatan (kajian, seminar, lomba)

import { getUsers } from './users';
import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_attendance';

// --- Kode Generator ---
// Menghasilkan kode unik 6 karakter per user per kegiatan
export const generateAttendanceCode = (userId, kegiatanId) => {
  const str = `${userId}-${kegiatanId}-ksei2024`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  let h = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    code += chars[h % chars.length];
    h = Math.floor(h / chars.length) + (i * 7);
  }
  return code;
};

// --- Read ---
export const getAttendance = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
export const saveAttendance = (data) => saveAndSync(STORAGE_KEY, data);

export const getAttendanceByKegiatan = (kegiatanId) => getAttendance().filter(a => a.kegiatanId === kegiatanId);
export const getUserAttendance = (kegiatanId, userId) => getAttendance().find(a => a.kegiatanId === kegiatanId && a.userId === userId);

// --- Create (Record Absen) ---
export const recordAttendance = (kegiatanId, userId, userName, code) => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return { error: 'User tidak ditemukan' };

  const expectedCode = generateAttendanceCode(userId, kegiatanId);
  if (code.toUpperCase() !== expectedCode) return { error: 'Kode absensi salah' };

  const list = getAttendance();
  const exists = list.find(a => a.kegiatanId === kegiatanId && a.userId === userId);
  if (exists) return { error: 'Anda sudah absen untuk kegiatan ini' };

  const record = {
    id: `att-${Date.now()}`,
    kegiatanId,
    userId,
    userName,
    code: expectedCode,
    timestamp: new Date().toISOString(),
  };
  list.push(record);
  saveAttendance(list);
  return { success: true };
};

// --- Generate semua kode untuk satu kegiatan (untuk cetak PDF) ---
export const getAllCodesForKegiatan = (kegiatanId) => {
  const members = getUsers().filter(u => u.role !== 'admin');
  return members.map(u => ({
    userId: u.id,
    name: u.name,
    npm: u.npm,
    divisi: u.divisi || '-',
    code: generateAttendanceCode(u.id, kegiatanId),
  }));
};

// --- Download / Cetak PDF kode absensi ---
export const downloadAttendancePDF = (kegiatanId, kegiatanTitle) => {
  const codes = getAllCodesForKegiatan(kegiatanId);
  if (codes.length === 0) {
    alert('Belum ada member. Tambahkan pengguna (member) terlebih dahulu.');
    return;
  }

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kode Absensi - ${kegiatanTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; background: #fff; }
    .header { border-bottom: 3px solid #006a4e; padding-bottom: 12px; margin-bottom: 8px; }
    .header h1 { font-size: 20px; color: #006a4e; }
    .header h2 { font-size: 14px; color: #666; font-weight: normal; margin-top: 4px; }
    .meta { font-size: 11px; color: #999; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      background: #006a4e; color: white; padding: 10px 14px;
      text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
    }
    tbody td {
      padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 12px;
    }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody tr:hover { background: #f0fdf4; }
    .code-cell {
      font-family: 'Courier New', monospace;
      font-size: 16px; font-weight: bold; color: #006a4e;
      letter-spacing: 4px; background: #f0fdf4;
      padding: 6px 10px; border-radius: 6px; display: inline-block;
      border: 1px dashed #006a4e;
    }
    .footer {
      margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb;
      font-size: 10px; color: #999; text-align: center;
    }
    .warning {
      background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;
      padding: 10px 14px; margin-bottom: 20px; font-size: 11px; color: #92400e;
    }
    @media print {
      body { padding: 15px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Kode Absensi Kegiatan</h1>
    <h2>${kegiatanTitle}</h2>
  </div>
  <p class="meta">Tanggal cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Total: ${codes.length} peserta</p>

  <div class="warning">
    ⚠️ <strong>RAHASIA</strong> — Setiap kode bersifat unik per individu. Jangan bagikan kode orang lain. Kode hanya berlaku untuk kegiatan ini.
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px">No</th>
        <th>Nama Lengkap</th>
        <th>NPM</th>
        <th>Divisi</th>
        <th style="width:160px">Kode Absensi</th>
      </tr>
    </thead>
    <tbody>
      ${codes.map((c, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${c.name}</strong></td>
        <td>${c.npm}</td>
        <td>${c.divisi}</td>
        <td><span class="code-cell">${c.code}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="footer">
    UKM KSEI RIIEF — UIN Raden Intan Lampung<br>
    Dokumen ini digenerate otomatis dan bersifat rahasia
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px">
    <button onclick="window.print()" style="padding:10px 24px;background:#006a4e;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600">
      🖨️ Cetak / Simpan PDF
    </button>
  </div>

  <script>
    // Auto print setelah load
    window.onload = function() {
      // Beri waktu render sebelum print dialog
      setTimeout(function() { window.print(); }, 800);
    };
  </script>
</body>
</html>`;

  // Buat blob dan buka di tab baru (menghindari popup blocker)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  // Buka di tab baru
  window.open(url, '_blank');
  // Fallback: jika popup diblokir, download langsung sebagai file HTML
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeAttendance = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
