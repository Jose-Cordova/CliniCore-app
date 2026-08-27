import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { estaAutenticado, cargando, tienePermiso } = useAuth();

  if (cargando) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !tienePermiso(rolesPermitidos)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;