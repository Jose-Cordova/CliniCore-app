import axiosClient from "./axiosClient";

export const doctorService = {
    //Obtener todos los doctores
    listarTodos: async () => {
        try {
            const response = await axiosClient.get("/doctores");
            return response.data || [];
        } catch (error) {
            console.warn("No se pudieron cargar todos los doctores (/doctores):", error?.message);
            return [];
        }
    },

    //Obtener un doctor por id
    obtenerPorId: async (id) => {
        const response = await axiosClient.get(`/doctores/${id}`);
        return response.data;
    },
};

export default doctorService;