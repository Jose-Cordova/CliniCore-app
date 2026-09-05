import axiosClient from "./axiosClient";

// Obtener citas del doctor autenticado
export const obtenerPorDoctor = async (doctorId) => {
    const response = await axiosClient.get(`/citas/doctor/${doctorId}`);
    return response.data;
};

// Cambiar estado de una cita
export const cambiarEstado = async (citaId, nuevoEstado) => {
    const response = await axiosClient.patch(`/citas/${citaId}/estado`, null, {
        params: { nuevoEstado }
    });
    return response.data;
};

// Método para agendar una cita
export const agendarCita = async ({ disponibilidadId, motivo }) => {
    const response = await axiosClient.post("/citas/agendar-cita", {
        disponibilidadId,
        motivo,
    });
    return response.data;
};

// NUEVO - Ajustamos el nombre para que coincida con lo que busca tu componente
export const obtenerCitasPorPaciente = async (pacienteId) => {
    const response = await axiosClient.get(`/citas/paciente/${pacienteId}`);
    return response.data;
};

// NUEVO - Ajustamos el nombre para que coincida con lo que busca tu componente
export const cancelarCitaPaciente = async (citaId) => {
    const response = await axiosClient.put(`/citas/${citaId}/cancelar`);
    return response.data;
};

// Obtener todas las citas
export const obtenerTodas = async () => {
    const response = await axiosClient.get("/citas");
    return response.data;
};
 // agregado 
 const citaService = {
    obtenerPorDoctor,
    cambiarEstado,
    agendarCita,
    obtenerCitasPorPaciente,
    cancelarCitaPaciente,
    obtenerTodas,
};

export default citaService;