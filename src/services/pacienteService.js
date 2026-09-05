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
    // NUEVO: Actualiza los datos del paciente (nombre, DUI, teléfono, dirección, etc.)
    actualizarPaciente: async (id, datosPaciente) => {
        const response = await axiosClient.put(`/pacientes/${id}`, datosPaciente);
        return response.data;
    },
    // NUEVO: Cambia el estado de archivado de un expediente (true/false)
    cambiarEstadoArchivado: async (id, archivado) => {
        const response = await axiosClient.patch(`/pacientes/${id}/archivado`, { archivado });
        return response.data;
    }
}

    },
    //Buscar paciente por codigo de expediente
    obtenerPorCodigoExpediente: async (codigoExpediente) => {
        const response = await axiosClient.get(`/pacientes/expediente/${codigoExpediente}`);
        return response.data;
    },
}

