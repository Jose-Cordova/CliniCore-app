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
    },

    //metodo para agendar una cita AGREGADI NUEVO
     agendarCita: async ({ disponibilidadId, motivo }) => {
        const response = await axiosClient.post("/citas/agendar-cita", {
            disponibilidadId,
            motivo,
        });
        return response.data;
    },

    // NUEVO
    obtenerPorPaciente: async (pacienteId) => {
        const response = await axiosClient.get(`/citas/paciente/${pacienteId}`);
        return response.data;
    },

    // NUEVO
    cancelar: async (citaId) => {
        const response = await axiosClient.put(`/citas/${citaId}/cancelar`);
        return response.data;
    },
}