import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const opcionesMenu = [
  { etiqueta: "Inicio", icono: "pi pi-home", ruta: "/" },
  {
    etiqueta: "Citas",
    icono: "pi pi-calendar",
    ruta: "/citas",
  },
  {
    etiqueta: "Pacientes",
    icono: "pi pi-users",
    ruta: "/pacientes",
  },
  {
    etiqueta: "Doctores",
    icono: "pi pi-user-md",
    ruta: "/doctores",
    rolesPermitidos: ["ADMIN"], // solo admin gestiona doctores
  },
  {
    etiqueta: "Especialidades",
    icono: "pi pi-list",
    ruta: "/especialidades",
    rolesPermitidos: ["ADMIN"],
  },
  {
    etiqueta: "Mi Expediente",
    icono: "pi pi-book",
    ruta: "/mi-expediente",
    rolesPermitidos: ["PACIENTE"], // solo pacientes ven su expediente
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { usuario, tienePermiso } = useAuth();
  const [submenuAbierto, setSubmenuAbierto] = useState(null);

  const opcionesVisibles = opcionesMenu.filter(
    (opcion) => !opcion.rolesPermitidos || tienePermiso(opcion.rolesPermitidos)
  );

  return (
    <aside
      className={`
        bg-sidebar text-slate-100 flex flex-col shrink-0
        fixed md:static inset-y-0 left-0 z-30 h-full
        transition-all duration-300 ease-in-out
        ${isOpen
          ? "w-64 translate-x-0"
          : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"}
      `}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-hover shrink-0">
        <span className="font-bold text-lg whitespace-nowrap text-white">CliniCore</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {opcionesVisibles.map((opcion) => (
          <div key={opcion.etiqueta}>
            {opcion.submenu ? (
              <SubmenuItem
                opcion={opcion}
                abierto={submenuAbierto === opcion.etiqueta}
                onClose={onClose}
                onToggle={() =>
                  setSubmenuAbierto(submenuAbierto === opcion.etiqueta ? null : opcion.etiqueta)
                }
              />
            ) : (
              <EnlaceMenu opcion={opcion} onClose={onClose} />
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-hover text-xs text-sidebar-text shrink-0 truncate">
        {usuario?.nombre}
      </div>
    </aside>
  );
};

const EnlaceMenu = ({ opcion, onClose }) => (
  <NavLink
    to={opcion.ruta}
    end={opcion.ruta === "/"}
    onClick={onClose}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
        isActive ? "bg-primary text-white" : "hover:bg-sidebar-hover"
      }`
    }
  >
    <i className={`${opcion.icono} text-base`} />
    {opcion.etiqueta}
  </NavLink>
);

const SubmenuItem = ({ opcion, abierto, onToggle, onClose }) => (
  <>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-sidebar-hover transition-colors"
    >
      <span className="flex items-center gap-3">
        <i className={`${opcion.icono} text-base`} />
        {opcion.etiqueta}
      </span>
      <i className={`pi pi-chevron-${abierto ? "up" : "down"} text-xs`} />
    </button>
    {abierto && (
      <div className="bg-sidebar-hover">
        {opcion.submenu.map((sub) => (
          <NavLink
            key={sub.ruta}
            to={sub.ruta}
            onClick={onClose}
            className={({ isActive }) =>
              `block pl-12 pr-4 py-2 text-sm transition-colors ${
                isActive ? "bg-primary text-white" : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {sub.etiqueta}
          </NavLink>
        ))}
      </div>
    )}
  </>
);

export default Sidebar;