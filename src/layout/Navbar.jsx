import { useAuth } from "../auth/AuthContext";

const getRolBadgeColor = (rol) => {
  switch (rol) {
    case "ADMIN":
      return "bg-amber-400/15 text-amber-300 border-amber-400/25";
    case "DOCTOR":
      return "bg-teal-400/15 text-teal-300 border-teal-400/25";
    case "PACIENTE":
      return "bg-emerald-400/15 text-emerald-300 border-emerald-400/25";
    default:
      return "bg-slate-700/40 text-slate-300 border-slate-600/40";
  }
};

const getIniciales = (nombre) => {
  if (!nombre) return "U";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const Navbar = ({ onToggleSidebar }) => {
  const { usuario, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-slate-900 via-sidebar to-slate-900 border-b border-slate-800 text-white shadow-md shrink-0">
      {/* Lado izquierdo: Botón menú y Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          aria-label="Alternar menú"
          title="Menú"
        >
          <i className="pi pi-bars text-lg" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <i className="pi pi-heart text-base font-bold text-teal-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-display font-extrabold tracking-tight text-white leading-none">
              Clini<span className="text-teal-400">Core</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              Portal Médico
            </span>
          </div>
        </div>
      </div>

      {/* Lado derecho: Info de Usuario, Avatar y Botón de Salir */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3 bg-white/5 border border-slate-700/60 rounded-2xl py-1.5 px-3">
          {/* Avatar con iniciales */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {getIniciales(usuario?.nombre)}
          </div>

          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-xs font-bold text-slate-200 max-w-[140px] truncate">
              {usuario?.nombre || "Usuario"}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border mt-0.5 ${getRolBadgeColor(
                usuario?.rol
              )}`}
            >
              {usuario?.rol || "INVITADO"}
            </span>
          </div>
        </div>

        {/* Botón Salir */}
        <button
          onClick={logout}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-95"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <i className="pi pi-sign-out text-base" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;