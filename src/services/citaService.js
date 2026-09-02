import axiosClient from "./axiosClient";

export const citaService = {
    //Obtener citas del doctor auntenticado
    obtenerPorDoctor: async (doctorId) => {
        const response = await axiosClient.get(`/citas/doctor/${doctorId}`);
        return response.data;
    },
    //Cambiar estado de una cita
    cambiarEstado: async (citaId, nuevoEstado) => {
        const response = await axiosClient.patch(`/citas/${citaId}/estado`, null, {
            params: {nuevoEstado}
        });
        return response.data;
    }
}