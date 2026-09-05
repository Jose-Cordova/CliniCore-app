import { createContext, useContext, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { CLAVE_TOKEN } from "../utils/constants";
import axiosClient from "../services/axiosClient";

const AuthContext = createContext(null);

const mapearPayload = (payload) => ({
  id: payload.id,
  email: payload.sub,
  nombre: payload.nombre,
  tipo: payload.tipo,
  rol: payload.rol,
  pacienteId: payload.pacienteId,
  doctorId: payload.doctorId,
  debeCambiarContrasenia: payload.debeCambiarContrasenia || false,
});

const obtenerSesionInicial = () => {
  const tokenGuardado = localStorage.getItem(CLAVE_TOKEN);
  if (!tokenGuardado) return { token: null, usuario: null };
  try {
    const payload = jwtDecode(tokenGuardado);
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(CLAVE_TOKEN);
      return { token: null, usuario: null };
    }
    return { token: tokenGuardado, usuario: mapearPayload(payload) };
  } catch {
    localStorage.removeItem(CLAVE_TOKEN);
    return { token: null, usuario: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [sesion, setSesion] = useState(obtenerSesionInicial);

  const login = useCallback((tokenNuevo) => {
    const payload = jwtDecode(tokenNuevo);
    localStorage.setItem(CLAVE_TOKEN, tokenNuevo);
    setSesion({
      token: tokenNuevo,
      usuario: mapearPayload(payload),
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    setSesion({
      token: null,
      usuario: null,
    });
  }, []);

  const cambiarContrasenia = useCallback(async (nuevaContrasenia) => {
    const respuesta = await axiosClient.post("/auth/cambiar-contrasenia", {
      nuevaContrasenia,
    });
    const payload = jwtDecode(respuesta.data.token);
    localStorage.setItem(CLAVE_TOKEN, respuesta.data.token);
    setSesion({
      token: respuesta.data.token,
      usuario: mapearPayload(payload),
    });
    return respuesta.data;
  }, []);

  const tienePermiso = useCallback(
    (rolesPermitidos) => {
      if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
      return sesion.usuario ? rolesPermitidos.includes(sesion.usuario.rol) : false;
    },
    [sesion.usuario]
  );

  const value = {
    usuario: sesion.usuario,
    token: sesion.token,
    cargando: false,
    estaAutenticado: !!sesion.token && !!sesion.usuario,
    login,
    logout,
    cambiarContrasenia,
    tienePermiso,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};