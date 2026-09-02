import axiosClient from "./axiosClient";

export const pacienteService = {
    //Obtener todos los pacientes
    obtenerTodos: async () => {
        const response = await axiosClient.get("/pacientes");
        return response.data;
    },
    //Obtener pacientes por id
    obtenerPorId: async (id) => {
        const response = await axiosClient.get(`/pacientes/${id}`);
        return response.data;
    },
    //Buscar paciente por codigo de expediente
    obtenerPorCodigoExpediente: async (codigoExpediente) => {
        const response = await axiosClient.get(`/pacientes/expediente/${codigoExpediente}`);
        return response.data;
    },
}