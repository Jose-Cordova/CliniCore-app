import { useAuth } from "../auth/AuthContext";

const Navbar = ({ onToggleSidebar }) => {
  const { usuario, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-surface-border shadow-sm shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Alternar menú"
        >
          <i className="pi pi-bars text-lg" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <i className="pi pi-heart text-sm font-bold" />
          </div>
          <span className="text-lg font-display font-bold text-slate-900">
            Clini<span className="text-blue-600">Core</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-slate-900">{usuario?.nombre}</span>
          <span className="text-xs text-surface-muted">{usuario?.rol}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <i className="pi pi-sign-out text-xl" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;