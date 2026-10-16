// Routing berbasis role — satu sumber kebenaran untuk home per role & akses area.

// Halaman utama (home) tiap role setelah login.
// TODO: saat halaman khusus sudah jadi, arahkan petugas -> "/dashboard/tugas",
//       hardware -> "/dashboard/perangkat".
export const ROLE_HOME = {
  admin: "/dashboard",
  supervisor: "/dashboard",
  petugas: "/dashboard/tugas",
  hardware: "/dashboard/perangkat",
  warga: "/lapor",
};

export function roleHome(role) {
  return ROLE_HOME[role] || "/lapor";
}

// Role staf yang boleh masuk area dashboard.
export const STAFF_ROLES = ["admin", "petugas", "supervisor", "hardware"];

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}