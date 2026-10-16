// Helper scoping unit organisasi.
// Supervisor dibatasi ke unitnya; admin & role lain tidak difilter di sini.
// Catatan: assets.unit menyimpan UID/ULP (text). Sesuaikan `column` bila berbeda.

function unitFilterValue(user) {
  if (!user) return null;
  if (user.role === "supervisor") {
    return user.ulp || user.up3 || user.uid || (user.profile && user.profile.unit) || null;
  }
  return null; // admin / petugas / warga / hardware: tidak difilter unit di sini
}

// Terapkan filter unit ke query supabase (default kolom 'unit'). Mengembalikan query.
function applyUnitScope(query, user, column = "unit") {
  const v = unitFilterValue(user);
  return v ? query.eq(column, v) : query;
}

module.exports = { unitFilterValue, applyUnitScope };