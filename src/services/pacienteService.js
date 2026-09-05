import axiosClient from "./axiosClient";

// Obtener todos los pacientes
export const obtenerTodos = async () => {
    const response = await axiosClient.get("/pacientes");
    return response.data;
};

// Obtener pacientes por id
export const obtenerPacientePorId = async (id) => {
    const response = await axiosClient.get(`/pacientes/${id}`);
    return response.data;
};

// Buscar paciente por codigo de expediente
export const obtenerPorCodigoExpediente = async (codigoExpediente) => {
    const response = await axiosClient.get(`/pacientes/expediente/${codigoExpediente}`);
    return response.data;
};

// NUEVO: Actualiza los datos del paciente (nombre, DUI, teléfono, dirección, etc.)
export const actualizarPaciente = async (id, datosPaciente) => {
    const response = await axiosClient.put(`/pacientes/${id}`, datosPaciente);
    return response.data;
};

// NUEVO: Cambia el estado de archivado de un expediente (true/false)
export const cambiarEstadoArchivado = async (id, archivado) => {
    const response = await axiosClient.patch(`/pacientes/${id}/archivado`, { archivado });
    return response.data;
};
     const pacienteService = {
    obtenerTodos,
    obtenerPacientePorId,
    obtenerPorCodigoExpediente,
    actualizarPaciente,
    cambiarEstadoArchivado,
};

export default pacienteService;
