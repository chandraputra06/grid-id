export const ROLE_HOME = {
  admin: "/dashboard",
  supervisor: "/dashboard",
  petugas: "/dashboard/tugas",
  hardware: "/dashboard/perangkat",
  b2b: "/business",
  warga: "/lapor",
};

export function roleHome(role) {
  return ROLE_HOME[role] || "/lapor";
}

// Role staf (boleh masuk dashboard admin). b2b SENGAJA tidak masuk sini —
// pelanggan B2B diarahkan ke /business lewat roleHome, bukan dashboard staf.
export const STAFF_ROLES = ["admin", "supervisor", "petugas", "hardware"];

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}