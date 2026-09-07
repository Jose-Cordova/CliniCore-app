import { useState, useEffect, useRef } from "react";
import { Button, Dialog, Toast, ConfirmDialog } from "../../config/primeReact";
import { confirmDialog } from "primereact/confirmdialog";
import { useAuth } from "../../auth/AuthContext";
import  citaService  from "../../services/citaService";
import  consultaService  from "../../services/consultaService";

const ESTADO_ESTILOS = {
  PENDIENTE: "bg-amber-50 text-amber-700",
  EN_ESPERA: "bg-blue-50 text-blue-700",
  ATENDIDA: "bg-emerald-50 text-emerald-700",
  CANCELADA: "bg-red-50 text-red-700",
  REASIGNADA: "bg-indigo-50 text-indigo-700",
};

const ESTADO_LABELS = {
  PENDIENTE: "Pendiente",
  EN_ESPERA: "En espera",
  ATENDIDA: "Atendida",
  CANCELADA: "Cancelada",
  REASIGNADA: "Reasignada",
};

const MisCitas = () => {
  const { usuario } = useAuth();
  const toast = useRef(null);

  const [citas, setCitas] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);

  const [cancelandoId, setCancelandoId] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [citasData, consultasData] = await Promise.all([
        citaService.obtenerCitasPorPaciente(usuario.pacienteId),
        consultaService.obtenerConsultasPorPaciente(usuario.pacienteId),
      ]);
      setCitas(citasData);
      setConsultas(consultasData);
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo cargar tu historial de citas.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario?.pacienteId) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.pacienteId]);

  const formatearFechaLegible = (fechaStr) => {
    if (!fechaStr) return "";
    const [anio, mes, dia] = fechaStr.split("-");
    const fechaObj = new Date(anio, mes - 1, dia);
    return fechaObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatearHora = (horaStr) => horaStr?.slice(0, 5); 

const confirmarCancelar = (cita) => {
  confirmDialog({
    message: "¿Seguro que deseas cancelar esta cita?",
    header: "Confirmar cancelación",
    icon: null,
    acceptLabel: "Sí, cancelar",
    rejectLabel: "No",
    acceptClassName: "!bg-red-500 hover:!bg-red-600 !border-none !text-white !font-semibold !rounded-full !px-6 !py-2 focus:!ring-0 focus:!outline-none",
    rejectClassName: "p-button-text !text-slate-700 !font-semibold hover:!bg-slate-50 !rounded-full !px-4 !py-2",
    accept: () => cancelarCita(cita.id),
    pt: {
      root: { className: "rounded-md overflow-hidden shadow-soft-xl !w-[32rem] max-w-[92vw]" },
      header: { className: "!bg-slate-900 !text-white px-8 py-6" }, 
      headerTitle: { className: "text-white font-semibold text-xl" },
      closeButton: { className: "text-white hover:bg-slate-800" },
      closeButtonIcon: { className: "text-white" },
      content: { className: "bg-white px-8 py-8 text-slate-700 text-lg" },
      footer: {
        className: "bg-white px-8 py-5 flex justify-end items-center gap-4 border-t border-surface-border",
      },
    },
  });
};
  const cancelarCita = async (citaId) => {
    setCancelandoId(citaId);
    try {
      await citaService.cancelar(citaId);
      toast.current?.show({
        severity: "success",
        summary: "Cita cancelada",
        detail: "Tu cita fue cancelada correctamente.",
      });
      cargarDatos();
    } catch (error) {
      const mensaje =
        error.response?.data?.message || "No se pudo cancelar la cita.";
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: mensaje,
      });
    } finally {
      setCancelandoId(null);
    }
  };

  const abrirResumenConsulta = (cita) => {
    const consulta = consultas.find((c) => c.citaId === cita.id);
    if (!consulta) {
      toast.current?.show({
        severity: "warn",
        summary: "Sin datos",
        detail: "No se encontró el resumen de esta consulta.",
      });
      return;
    }
    setConsultaSeleccionada(consulta);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setConsultaSeleccionada(null);
  };

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog 
    pt={{
    root: { className: "rounded-md overflow-hidden shadow-soft-xl !w-[26rem] max-w-[90vw]" },
    header: { className: "bg-primary text-white px-6 py-5" },
    headerTitle: { className: "text-white font-semibold text-lg" },
    closeButton: { className: "text-white hover:bg-primary-hover" },
    content: { className: "bg-white px-6 py-6 text-slate-700 text-base" },
    footer: {
      className: "bg-white px-6 py-4 flex justify-end gap-3 border-t border-surface-border",
    },
  }}
/>

      <div className="bg-surface-card rounded-xl shadow-soft border border-surface-border p-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">Mis citas</h1>
        <p className="text-surface-muted text-sm mt-1 mb-6">
          Historial y estado de tus citas médicas.
        </p>

        {cargando && <p className="text-surface-muted text-sm">Cargando tus citas...</p>}

        {!cargando && citas.length === 0 && (
          <p className="text-surface-muted text-sm">Aún no tienes citas agendadas.</p>
        )}

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-1">
  {citas.map((cita) => {
    const fechaObj = cita.fecha ? new Date(...cita.fecha.split("-").map((n, i) => (i === 1 ? n - 1 : n))) : null;
    const dia = fechaObj ? String(fechaObj.getDate()).padStart(2, "0") : "--";
    const mes = fechaObj
      ? fechaObj.toLocaleDateString("es-ES", { month: "short" }).replace(".", "").toUpperCase()
      : "";

    return (
      <div
        key={cita.id}
        className="border border-surface-border rounded-xl shadow-soft overflow-hidden flex flex-col"
      >
        <div className="flex gap-3 p-4">
          {/* Badge de fecha */}
          <div className="flex flex-col items-center justify-center bg-primary-50 text-primary rounded-lg w-14 h-14 shrink-0">
            <span className="text-lg font-bold leading-none">{dia}</span>
            <span className="text-[10px] font-semibold uppercase mt-0.5">{mes}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-slate-800 text-sm leading-tight">
                {cita.motivo}
              </h3>
              <span
                className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  ESTADO_ESTILOS[cita.estado] || "bg-slate-100 text-slate-600"
                }`}
              >
                {ESTADO_LABELS[cita.estado] || cita.estado}
              </span>
            </div>

            <p className="text-surface-muted text-xs mt-1">
              Dr(a). {cita.doctorNombre || "—"}
              {cita.horaInicio && ` · ${formatearHora(cita.horaInicio)}`}
              {cita.horaFin && `-${formatearHora(cita.horaFin)}`}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 mt-auto">
          {cita.estado === "PENDIENTE" && (
            <Button
              label="Cancelar cita"
              className="!bg-red-500 hover:!bg-red-600 !border-none !text-white !font-semibold text-xs py-2 px-3 rounded-lg w-full focus:!ring-0 focus:!outline-none"
              onClick={() => confirmarCancelar(cita)}
              loading={cancelandoId === cita.id}
            />
          )}
          {cita.estado === "ATENDIDA" && (
            <Button
              label="Ver resumen de consulta"
              className="p-button-outlined text-xs py-1.5 px-3 rounded-lg w-full"
              onClick={() => abrirResumenConsulta(cita)}
            />
          )}
        </div>
      </div>
    );
  })}
</div>
      </div>

      <Dialog
        header="Resumen de consulta"
        visible={modalVisible}
        onHide={cerrarModal}
        style={{ width: "32rem" }}
        modal
      >
        {consultaSeleccionada && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-surface-muted text-xs font-semibold uppercase">Doctor</span>
                <p className="text-slate-800 font-medium">
                  Dr(a). {consultaSeleccionada.doctorNombre}
                </p>
              </div>
              <div>
                <span className="text-surface-muted text-xs font-semibold uppercase">
                  Fecha de atención
                </span>
                <p className="text-slate-800 font-medium">
                  {consultaSeleccionada.fechaAtencion
                    ? new Date(consultaSeleccionada.fechaAtencion).toLocaleString("es-ES")
                    : "—"}
                </p>
              </div>
            </div>

            <div className="border-t border-surface-border pt-3">
              <h4 className="text-xs font-semibold uppercase text-surface-muted mb-2">
                Signos vitales
              </h4>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <p><strong>Presión arterial:</strong> {consultaSeleccionada.tirajePa}</p>
                <p><strong>Temperatura:</strong> {consultaSeleccionada.tirajeTemperatura} °C</p>
                <p><strong>Peso:</strong> {consultaSeleccionada.tirajePeso} kg</p>
                <p><strong>Estatura:</strong> {consultaSeleccionada.tirajeEstatura} m</p>
              </div>
              <p className="mt-2 text-slate-700">
                <strong>Síntomas reportados:</strong> {consultaSeleccionada.tirajeSintomas}
              </p>
            </div>

            <div className="border-t border-surface-border pt-3">
              <h4 className="text-xs font-semibold uppercase text-surface-muted mb-2">
                Diagnóstico médico
              </h4>
              <p className="text-slate-700">{consultaSeleccionada.diagnostico}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-surface-muted mb-2">
                Tratamiento
              </h4>
              <p className="text-slate-700">{consultaSeleccionada.tratamiento}</p>
            </div>

            {consultaSeleccionada.nota && (
              <div>
                <h4 className="text-xs font-semibold uppercase text-surface-muted mb-2">
                  Notas adicionales
                </h4>
                <p className="text-slate-700">{consultaSeleccionada.nota}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button label="Cerrar" className="p-button-text" onClick={cerrarModal} />
        </div>
      </Dialog>
    </div>
  );
};

export default MisCitas;