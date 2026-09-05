import axiosClient from "./axiosClient";

export const doctorService = {
    // Obtener todos los doctores
    listarTodos: async () => {
        const response = await axiosClient.get("/doctores");
        return response.data;
    },

    // Obtener un doctor por id
    obtenerPorId: async (id) => {
        const response = await axiosClient.get(`/doctores/${id}`);
        return response.data;
    },
};