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

// INI yang menyebabkan bounce kalau masih ["admin","petugas"] saja
export const STAFF_ROLES = ["admin", "supervisor", "petugas", "hardware"];

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}