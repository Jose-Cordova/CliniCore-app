import axiosClient from "./axiosClient";

/**
 * Obtiene todas las citas registradas de un paciente por su pacienteId.
 * @param {number} pacienteId - ID del paciente
 * @returns {Promise<Array>} Lista de CitaDTO
 */
export const obtenerCitasPorPaciente = async (pacienteId) => {
  const respuesta = await axiosClient.get(`/citas/paciente/${pacienteId}`);
  return respuesta.data;
};

/**
 * Cancela una cita por su ID.
 * @param {number} citaId - ID de la cita
 * @returns {Promise<Object>} Respuesta de cancelación
 */
export const cancelarCitaPaciente = async (citaId) => {
  const respuesta = await axiosClient.put(`/citas/${citaId}/cancelar`);
  return respuesta.data;
};
