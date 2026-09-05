import axiosClient from "./axiosClient";

/**
 * Obtiene el historial completo de consultas/expedientes atendidos de un paciente.
 * @param {number} pacienteId - ID del paciente
 * @returns {Promise<Array>} Lista de objetos ConsultaDTO
 */
export const obtenerConsultasPorPaciente = async (pacienteId) => {
  const respuesta = await axiosClient.get(`/consultas/paciente/${pacienteId}`);
  return respuesta.data;
};

/**
 * Obtiene el historial de consultas realizadas por un doctor.
 * @param {number} doctorId - ID del doctor
 * @returns {Promise<Array>} Lista de objetos ConsultaDTO
 */
export const obtenerConsultasPorDoctor = async (doctorId) => {
  const respuesta = await axiosClient.get(`/consultas/doctor/${doctorId}`);
  return respuesta.data;
};
