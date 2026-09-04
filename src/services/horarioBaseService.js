import axiosClient from "./axiosClient";

export const horarioBaseService = {
    //Obtener horarios base de un doctor
    obtenerPorDoctor: async (doctorId) => {
        const response = await axiosClient.get(`/horarios-base/doctor/${doctorId}`);
        return response.data;
    },
    //Guardar/Actualizar horario base de un doctor
    guardar: async (doctorId, horarios) => {
        const response = await axiosClient.put(`/horarios-base/doctor/${doctorId}`, horarios);
        return response.data;
    }
}