import axiosClient from "./axiosClient";

    export const reporteService = {
      descargarReporteCitas: async (fechaInicio, fechaFin) => {
        try {
          return await axiosClient.get("/reportes/citas", {
            params: { fechaInicio, fechaFin },
            responseType: "blob",
          });
        } catch (error) {
          if (error.response?.data instanceof Blob) {
            const texto = await error.response.data.text();
            try {
              error.response.data = JSON.parse(texto);
            } catch {
              
            }
          }
          throw error;
        }
      },
    };

    export default reporteService;