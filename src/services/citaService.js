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

export const obtenerCitasPorPaciente = async (pacienteId) => {
    const response = await axiosClient.get(`/citas/paciente/${pacienteId}`);
    return response.data;
};

export const cancelarCitaPaciente = async (citaId) => {
    const response = await axiosClient.put(`/citas/${citaId}/cancelar`);
    return response.data;
};

// Obtener todas las citas (para estadísticas globales)
export const obtenerTodas = async () => {
    try {
        const response = await axiosClient.get("/citas");
        return response.data || [];
    } catch (error) {
        console.warn("No se pudieron cargar todas las citas (/citas):", error?.message);
        return [];
    }
};

const citaService = {
    obtenerPorDoctor,
    cambiarEstado,
    agendarCita,
    obtenerCitasPorPaciente,
    cancelarCitaPaciente,
    obtenerTodas,
};

export default citaService;