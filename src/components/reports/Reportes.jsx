import { useState } from "react";
    import ReporteCitasModal from "./ReporteCitasModal";

    const reportesDisponibles = [
      {
        id: "citas-medicas",
        titulo: "Reporte de Citas Médicas",
        descripcion: "Reporte de citas filtrado por rango de fechas y agrupado por estado.",
        icono: "pi pi-file-pdf",
      },
    ];

    export default function Reportes() {
      const [reporteActivo, setReporteActivo] = useState(null);

      return (
        <div className="p-2 md:p-4">
          <h4 className="text-xl font-bold text-gray-700 mb-4">Reportes Administrativos</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportesDisponibles.map((reporte) => (
              <button
                key={reporte.id}
                onClick={() => setReporteActivo(reporte.id)}
                className="text-left bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-shadow border border-gray-100 cursor-
  pointer"
              >
                <i className={`${reporte.icono} text-3xl text-blue-600 mb-2 block`} />
                <h5 className="font-bold text-gray-800">{reporte.titulo}</h5>
                <p className="text-sm text-gray-500 mt-1">{reporte.descripcion}</p>
              </button>
            ))}
          </div>

          {reporteActivo === "citas-medicas" && (
            <ReporteCitasModal visible={true} onHide={() => setReporteActivo(null)} />
          )}
        </div>
      );
    }