import axiosClient from "./axiosClient";

// Doctor finaliza consulta con diagnostico
export const finalizarConsulta = async (citaId, consultaDTO) => {
    const response = await axiosClient.put(`/consultas/cita/${citaId}/finalizar`, consultaDTO);
    return response.data;
};

// Obtener historial completo de consultas/expedientes de un paciente
export const obtenerExpediente = async (pacienteId) => {
    const response = await axiosClient.get(`/consultas/paciente/${pacienteId}`);
    return response.data;
};

// Trae todo el historial de consultas del paciente (cada una con su citaId)
// NUEVO: Se renombra para que coincida exactamente con la importación del Dashboard
export const obtenerConsultasPorPaciente = async (pacienteId) => {
    const response = await axiosClient.get(`/consultas/paciente/${pacienteId}`);
    return response.data;
};

// Enfermera/o registra los signos vitales
export const registrarTiraje = async (tirajeDTO) => {
    const response = await axiosClient.post("/consultas/tiraje", tirajeDTO);
    return response.data;
};

// NUEVO: Obtiene el historial de consultas realizadas por un doctor
export const obtenerConsultasPorDoctor = async (doctorId) => {
    const response = await axiosClient.get(`/consultas/doctor/${doctorId}`);
    return response.data;
};

const consultaService = {
    finalizarConsulta,
    obtenerExpediente,
    obtenerConsultasPorPaciente,
    registrarTiraje,
    obtenerConsultasPorDoctor,
};

export default consultaService;
