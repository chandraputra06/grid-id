const supabase = require("../config/supabase");
const ApiError = require("../utils/apiError");

// Verifikasi JWT Supabase + muat role dari tabel profiles -> req.user
async function requireAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token)
      throw new ApiError(401, "unauthorized", "Perlu login (token tidak ada)");

    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      // 401/403 = token memang invalid; selain itu = gangguan verifikasi (network/Supabase)
      if (error.status === 401 || error.status === 403) {
        throw new ApiError(
          401,
          "unauthorized",
          "Token tidak valid/kedaluwarsa",
        );
      }
      throw new ApiError(
        503,
        "auth_unavailable",
        "Gagal memverifikasi sesi, coba lagi",
      );
    }
    if (!data || !data.user)
      throw new ApiError(401, "unauthorized", "Token tidak valid/kedaluwarsa");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, phone, unit")
      .eq("id", data.user.id)
      .maybeSingle();

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: (profile && profile.role) || "warga",
      profile: profile || null,
    };
    next();
  } catch (e) {
    next(e);
  }
}

// Batasi akses ke role tertentu. Pakai setelah requireAuth.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user)
      return next(new ApiError(401, "unauthorized", "Perlu login"));
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "forbidden",
          `Role '${req.user.role}' tidak diizinkan`,
        ),
      );
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
