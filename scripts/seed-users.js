// Seed 3 akun demo (admin/petugas/warga) via Supabase Admin API (service_role).
// Role diisi lewat user_metadata -> trigger handle_new_user menuliskannya ke profiles.
require('dotenv').config();
const supabase = require('../src/config/supabase');

const USERS = [
  { email: 'admin@grid.id',   password: 'Password',   full_name: 'Admin GRID',       role: 'admin' },
  { email: 'petugas@grid.id', password: 'Password', full_name: 'Petugas Lapangan', role: 'petugas' },
  { email: 'warga@grid.id',   password: 'Password',   full_name: 'Warga',    role: 'warga' },
];

async function main() {
  for (const u of USERS) {
    const { error } = await supabase.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });
    if (error) {
      if (/already|registered|exists/i.test(error.message)) { console.log(`- ${u.email} sudah ada, skip`); continue; }
      throw error;
    }
    console.log(`\u2713 ${u.email} (${u.role}) — password: ${u.password}`);
  }
}
main().catch((e) => { console.error('Seed users gagal:', e.message); process.exit(1); });