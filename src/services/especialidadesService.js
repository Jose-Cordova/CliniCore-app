import axiosClient from "./axiosClient";

export const listarEspecialidades = async () => {
    const respuesta = await axiosClient.get("/especialidades");
    return respuesta.data;
};

export const crearEspecialidad = async (nombre) => {
    const respuesta = await axiosClient.post("/especialidades", { nombre });
    return respuesta.data;
};