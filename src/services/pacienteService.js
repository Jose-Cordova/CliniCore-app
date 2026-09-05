import axiosClient from "./axiosClient";

// Obtiene la información de un paciente por su ID
export const obtenerPacientePorId = async (id) => {
  const respuesta = await axiosClient.get(`/pacientes/${id}`);
  return respuesta.data;
};

// Obtiene un paciente usando su código de expediente (ej: C08-001)
export const obtenerPacientePorExpediente = async (codigoExpediente) => {
  const respuesta = await axiosClient.get(`/pacientes/expediente/${codigoExpediente}`);
  return respuesta.data;
};

// Actualiza los datos del paciente (nombre, DUI, teléfono, dirección, etc.)
export const actualizarPaciente = async (id, datosPaciente) => {
  const respuesta = await axiosClient.put(`/pacientes/${id}`, datosPaciente);
  return respuesta.data;
};

// Obtiene la lista completa de todos los pacientes (para administración)
export const listarPacientes = async () => {
  const respuesta = await axiosClient.get("/pacientes");
  return respuesta.data;
};

// Cambia el estado de archivado de un expediente (true/false)
export const cambiarEstadoArchivado = async (id, archivado) => {
  const respuesta = await axiosClient.patch(`/pacientes/${id}/archivado`, { archivado });
  return respuesta.data;
};