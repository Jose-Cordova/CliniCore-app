import axiosClient from "./axiosClient";

export const disponibilidadServie = {
    //Generar los slots de 30 minutos 
    generar: async ({doctorId, fechaInicio, fechaFin}) => {
        const response = await axiosClient.post("/disponibilidades/generar", {
            doctorId,
            fechaInicio,
            fechaFin
        });
        return response.data;
    },
    //Obtener los slots  de un doctor para una fecha especifica
    obtenerDoctorPorFecha: async (doctorId, fecha) => {
        const response = await axiosClient.get(`/disponibilidades/doctor/${doctorId}`, {
            params: {fecha}
        });
        return response.data;
    },
    //Obtener los slots de un doctor por especialidad
    obtenerPorEspecialidadYFecha: async (especialidadId, fecha) => {
        const response = await axiosClient.get(`/disponibilidades/especialidad/${especialidadId}`, {
            params: {fecha}
        });
        return response.data;
    }
}