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
export const obtenerConsultasPorPaciente = async (pacienteId) => {
    const response = await axiosClient.get(`/consultas/paciente/${pacienteId}`);
    return response.data;
};

// Enfermera/o registra los signos vitales
export const registrarTiraje = async (tirajeDTO) => {
    const response = await axiosClient.post("/consultas/tiraje", tirajeDTO);
    return response.data;
};

// Obtiene el historial de consultas realizadas por un doctor
export const obtenerConsultasPorDoctor = async (doctorId) => {
    const response = await axiosClient.get(`/consultas/doctor/${doctorId}`);
    return response.data;
};

// Obtener todas las consultas (para estadísticas globales)
export const obtenerTodas = async () => {
    try {
        const response = await axiosClient.get("/consultas");
        return response.data || [];
    } catch (error) {
        console.warn("No se pudieron cargar todas las consultas (endpoint /consultas):", error?.message);
        return [];
    }
};

export const consultaService = {
    finalizarConsulta,
    obtenerExpediente,
    obtenerConsultasPorPaciente,
    registrarTiraje,
    obtenerConsultasPorDoctor,
    obtenerTodas,
};

export default consultaService;
