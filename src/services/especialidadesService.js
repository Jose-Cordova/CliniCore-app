import axiosClient from "./axiosClient";

export const listarEspecialidades = async () => {
    const respuesta = await axiosClient.get("/especialidades");
    return respuesta.data;
};

export const crearEspecialidad = async (nombre) => {
    const respuesta = await axiosClient.post("/especialidades", { nombre });
    return respuesta.data;
};
export const actualizarEspecialidad = async (id, nombre) => {
    const respuesta = await axiosClient.put(`/especialidades/${id}`, { nombre });
    return respuesta.data;
};

export const eliminarEspecialidad = async (id) => {
    const respuesta = await axiosClient.delete(`/especialidades/${id}`);
    return respuesta.data;
};