import axiosClient from "./axiosClient";

export const consultaService = {
    //Doctor finaliza consulta con diagnostico
    finalizarConsulta: async (citaId, consultaDTO) => {
        const response = await axiosClient.put(`/consultas/cita/${citaId}/finalizar`, consultaDTO);
        return response.data;
    },
    //Obtener historial completo de consultas/expedientes de un paciente
    obtenerExpediente: async (pacienteId) => {
        const response = await axiosClient.get(`/consultas/paciente/${pacienteId}`);
        return response.data;
    }
}