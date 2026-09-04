import axiosClient from "./axiosClient";

/**
 * Servicio centralizado para todas las operaciones relacionadas con usuarios.
 * Encapsula las llamadas HTTP para que el componente GestionUsuarios no
 * dependa directamente de axiosClient.
 */
const usuarioService = {
  // Listar todos los usuarios del sistema
  listarUsuarios: async () => {
    const resp = await axiosClient.get("/usuarios");
    return resp.data;
  },

  // Registrar Doctor (el admin lo crea, genera contraseña temporal automáticamente)
  registrarDoctor: async (datos) => {
    const resp = await axiosClient.post("/auth/registro-doctor", datos);
    return resp.data;
  },

  // Registrar Personal / Recepcionista (genera contraseña temporal)
  registrarPersonal: async (datos) => {
    const resp = await axiosClient.post("/auth/registro-personal", datos);
    return resp.data;
  },

  // Registrar Administrador (genera contraseña temporal)
  registrarAdmin: async (datos) => {
    const resp = await axiosClient.post("/auth/registro-admin", datos);
    return resp.data;
  },

  // Cambiar estado activo/inactivo de un usuario
  cambiarEstado: async (id, estado) => {
    const resp = await axiosClient.patch(`/usuarios/${id}/estado`, { estado });
    return resp.data;
  },

  // *** Resetear contraseña — genera nueva contraseña temporal para Doctor/Personal/Admin ***
  // Respuesta: { token, email, nombre, tipo, role, debeCambiarContrasenia: true, contraseniaTemporal: "..." }
  resetearContrasenia: async (id) => {
    const resp = await axiosClient.post(`/usuarios/${id}/reset-password`);
    return resp.data;
  },

  // Cambiar contraseña propia (el usuario autenticado establece su contraseña definitiva)
  cambiarContrasenia: async (nuevaContrasenia) => {
    const resp = await axiosClient.post("/auth/cambiar-contrasenia", { nuevaContrasenia });
    return resp.data;
  },
};

export default usuarioService;
