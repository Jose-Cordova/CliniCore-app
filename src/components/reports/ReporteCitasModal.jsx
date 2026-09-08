import { useState, useRef } from "react";
    import { Dialog } from "primereact/dialog";
    import { Calendar } from "primereact/calendar";
    import { Button } from "primereact/button";
    import { Toast } from "primereact/toast";

    import { reporteService } from "../../services/reporteService";
    import citaService from "../../services/citaService";
    import { mostrarErrorApi } from "../../utils/alertasApi";

    const formatearFechaParaBackend = (fecha) => {
      if (!fecha) return null;
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    export default function ReporteCitasModal({ visible, onHide }) {
      const [fechaInicio, setFechaInicio] = useState(null);
      const [fechaFin, setFechaFin] = useState(null);
      const [generando, setGenerando] = useState(false);

      const toast = useRef(null);

      const generarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
          toast.current.show({
            severity: "warn",
            summary: "Atención",
            detail: "Seleccione ambas fechas",
          });
          return;
        }
        if (fechaInicio > fechaFin) {
          toast.current.show({
            severity: "warn",
            summary: "Atención",
            detail: "La fecha de inicio no puede ser posterior a la fecha fin",
          });
          return;
        }

        const fechaInicioStr = formatearFechaParaBackend(fechaInicio);
        const fechaFinStr = formatearFechaParaBackend(fechaFin);

        const nuevaPestana = window.open("", "_blank");
        if (nuevaPestana) {
          nuevaPestana.document.write("Generando el reporte de citas médicas...");
        }

        setGenerando(true);
        try {
          const todasLasCitas = await citaService.obtenerTodas();
          const citasEnRango = todasLasCitas.filter((c) => {
            if (!c.fecha) return false;
            return c.fecha >= fechaInicioStr && c.fecha <= fechaFinStr;
          });

          if (citasEnRango.length === 0) {
            if (nuevaPestana) nuevaPestana.close();
            toast.current.show({
              severity: "warn",
              summary: "Atención",
              detail: "No se encontraron registros de citas en el rango seleccionado.",
              life: 4000,
            });
            return;
          }

          const respuesta = await reporteService.descargarReporteCitas(
            fechaInicioStr,
            fechaFinStr
          );

          const blobUrl = window.URL.createObjectURL(
            new Blob([respuesta.data], { type: "application/pdf" })
          );

          if (nuevaPestana) {
            nuevaPestana.location.href = blobUrl;
          } else {
            toast.current.show({
              severity: "warn",
              summary: "Atención",
              detail:
                "El navegador bloqueó la ventana emergente. Habilite las ventanas emergentes para este sitio.",
              life: 6000,
            });
          }

          onHide();
        } catch (error) {
          if (nuevaPestana) nuevaPestana.close();
          mostrarErrorApi(toast, error, "No se pudo generar el reporte de citas");
        } finally {
          setGenerando(false);
        }
      };

      return (
        <Dialog
          visible={visible}
          style={{ width: "28rem" }}
          header="Reporte de Citas Médicas"
          modal
          onHide={onHide}
          footer={
            <div className="flex justify-end gap-2">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                outlined
                onClick={onHide}
                disabled={generando}
              />
              <Button
                label="Generar Reporte"
                icon="pi pi-file-pdf"
                onClick={generarReporte}
                loading={generando}
              />
            </div>
          }
        >
          <Toast ref={toast} />

          <div className="field mb-4">
            <label className="font-bold block mb-2">Fecha inicio</label>
            <Calendar
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.value)}
              dateFormat="dd/mm/yy"
              className="w-full"
              showIcon
            />
          </div>

          <div className="field">
            <label className="font-bold block mb-2">Fecha fin</label>
            <Calendar
              value={fechaFin}
              onChange={(e) => setFechaFin(e.value)}
              dateFormat="dd/mm/yy"
              className="w-full"
              showIcon
            />
          </div>
        </Dialog>
      );
    }