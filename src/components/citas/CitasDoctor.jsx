import { useState, useEffect, useRef, useMemo } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { useAuth } from "../../auth/AuthContext";
import { citaService } from "../../services/citaService";
import { consultaService } from "../../services/consultaService";
import { mostrarExitoApi, mostrarErrorApi, mostrarAdvertenciaApi } from "../../utils/alertasApi";

const ESTADO_CONFIG = {
  PENDIENTE: { color: "warning", label: "Pendiente", icon: "pi-clock", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  EN_ESPERA: { color: "info", label: "En Espera", icon: "pi-hourglass", bg: "bg-sky-50 text-sky-700 border-sky-200" },
  ATENDIDA: { color: "success", label: "Atendida", icon: "pi-check-circle", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELADA: { color: "danger", label: "Cancelada", icon: "pi-times-circle", bg: "bg-red-50 text-red-700 border-red-200" },
  REASIGNADA: { color: "secondary", label: "Reasignada", icon: "pi-refresh", bg: "bg-purple-50 text-purple-700 border-purple-200" },
};

const getIniciales = (nombre) => {
  if (!nombre) return "P";
  return nombre
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function CitasDoctor() {
  const { usuario } = useAuth();
  const doctorId = usuario?.doctorId;
  const toast = useRef(null);

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // Modal de consulta
  const [modalConsulta, setModalConsulta] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [saving, setSaving] = useState(false);
  const [consulta, setConsulta] = useState({
    diagnostico: "",
    tratamiento: "",
    nota: "",
  });

  useEffect(() => {
    if (doctorId) cargarCitas();
  }, [doctorId]);

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const data = await citaService.obtenerPorDoctor(doctorId);
      setCitas(data || []);
    } catch (err) {
      mostrarErrorApi(toast, err, "Error al cargar las citas.");
    } finally {
      setLoading(false);
    }
  };

  // Métricas calculadas
  const metricas = useMemo(() => {
    const total = citas.length;
    const enEspera = citas.filter((c) => c.estado === "EN_ESPERA").length;
    const atendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
    const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
    return { total, enEspera, atendidas, pendientes };
  }, [citas]);

  // Citas filtradas por estado
  const citasFiltradas = useMemo(() => {
    if (filtroEstado === "TODOS") return citas;
    return citas.filter((c) => c.estado === filtroEstado);
  }, [citas, filtroEstado]);

  // Abrir modal para registrar diagnostico
  const abrirModalConsulta = (cita) => {
    setCitaSeleccionada(cita);
    setConsulta({ diagnostico: "", tratamiento: "", nota: "" });
    setModalConsulta(true);
  };

  // Finalizar consulta con diagnostico
  const handleFinalizarConsulta = async () => {
    if (!consulta.diagnostico.trim()) {
      mostrarAdvertenciaApi(toast, "El diagnóstico es obligatorio.");
      return;
    }
    if (!consulta.tratamiento.trim()) {
      mostrarAdvertenciaApi(toast, "El tratamiento es obligatorio.");
      return;
    }
    setSaving(true);

    try {
      const res = await consultaService.finalizarConsulta(citaSeleccionada.id, consulta);
      mostrarExitoApi(toast, res?.message || "Consulta finalizada correctamente.");
      setModalConsulta(false);
      cargarCitas();
    } catch (err) {
      mostrarErrorApi(toast, err, "Error al finalizar la consulta.");
    } finally {
      setSaving(false);
    }
  };

  // Templates visuales de columnas
  const pacienteTemplate = (rowData) => (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
        {getIniciales(rowData.pacienteNombre)}
      </div>
      <div className="min-w-0">
        <span className="text-xs font-bold text-slate-800 block truncate">
          {rowData.pacienteNombre || "Paciente no asignado"}
        </span>
        <span className="text-[11px] text-slate-400">
          Cita #{rowData.id}
        </span>
      </div>
    </div>
  );

  const fechaTemplate = (rowData) => {
    if (!rowData.fecha) return <span className="text-slate-400 text-xs">—</span>;
    const fechaObj = new Date(rowData.fecha + "T00:00:00");
    return (
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-800">
          {fechaObj.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span className="text-[11px] text-slate-400 capitalize">
          {fechaObj.toLocaleDateString("es-ES", { weekday: "long" })}
        </span>
      </div>
    );
  };

  const horaTemplate = (rowData) => {
    if (!rowData.horaInicio) return <span className="text-slate-400 text-xs">—</span>;
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
        <i className="pi pi-clock text-[10px] text-blue-600" />
        <span>{rowData.horaInicio.slice(0, 5)}</span>
      </div>
    );
  };

  const motivoTemplate = (rowData) => (
    <div className="max-w-xs">
      <span className="text-xs text-slate-700 line-clamp-2" title={rowData.motivo}>
        {rowData.motivo || "Sin motivo especificado"}
      </span>
    </div>
  );

  const estadoTemplate = (rowData) => {
    const config = ESTADO_CONFIG[rowData.estado] || {
      color: "info",
      label: rowData.estado,
      icon: "pi-circle",
      bg: "bg-slate-50 text-slate-700 border-slate-200",
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${config.bg}`}>
        <i className={`pi ${config.icon} text-[10px]`} />
        <span>{config.label}</span>
      </span>
    );
  };

  const accionesTemplate = (rowData) => (
    <div className="flex items-center justify-end gap-2">
      {rowData.estado === "EN_ESPERA" && (
        <Button
          icon="pi pi-stethoscope"
          label="Atender"
          size="small"
          onClick={() => abrirModalConsulta(rowData)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm border-none transition-all"
        />
      )}
      {rowData.estado === "ATENDIDA" && (
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
          <i className="pi pi-check text-[10px]" />
          Completada
        </span>
      )}
      {rowData.estado === "PENDIENTE" && (
        <span className="text-[11px] text-slate-400 italic">En preparación</span>
      )}
      {rowData.estado === "CANCELADA" && (
        <span className="text-[11px] text-red-500 font-medium">Cancelada</span>
      )}
      {rowData.estado === "REASIGNADA" && (
        <span className="text-[11px] text-purple-600 font-medium">Reasignada</span>
      )}
    </div>
  );

  // Header de la tabla con barra de filtros y buscador moderno
  const header = (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
      {/* Botones de filtro rápido por estado */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { key: "TODOS", label: "Todas las Citas", icon: "pi-list" },
          { key: "EN_ESPERA", label: "En Espera", icon: "pi-hourglass" },
          { key: "PENDIENTE", label: "Pendientes", icon: "pi-clock" },
          { key: "ATENDIDA", label: "Atendidas", icon: "pi-check-circle" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltroEstado(f.key)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border ${
              filtroEstado === f.key
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 border-transparent"
                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80 shadow-xs"
            }`}
          >
            <i className={`pi ${f.icon} text-xs`} />
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Buscador estilizado */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="relative flex-1 lg:w-80">
          <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Buscar por paciente, motivo..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[9px] border-none cursor-pointer"
            >
              <i className="pi pi-times" />
            </button>
          )}
        </div>

        <Button
          icon="pi pi-refresh"
          onClick={cargarCitas}
          loading={loading}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs"
          title="Recargar citas"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Toast ref={toast} />

      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-900 m-0">
            Mis Citas Médicas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            Panel de control de citas agendadas, atención de pacientes y registro de diagnósticos.
          </p>
        </div>
      </div>

      {/* Tabla Principal de Citas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 md:p-6 space-y-4">
        <DataTable
          value={citasFiltradas}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20]}
          emptyMessage="No se encontraron citas con los filtros seleccionados."
          sortField="fecha"
          sortOrder={-1}
          stripedRows
          responsiveLayout="stack"
          breakpoint="768px"
          className="text-xs"
        >
          <Column field="pacienteNombre" header="Paciente" body={pacienteTemplate} sortable style={{ minWidth: "200px" }} />
          <Column field="fecha" header="Fecha Cita" body={fechaTemplate} sortable style={{ minWidth: "140px" }} />
          <Column field="horaInicio" header="Hora" body={horaTemplate} sortable style={{ minWidth: "100px" }} />
          <Column field="motivo" header="Motivo de Consulta" body={motivoTemplate} style={{ minWidth: "220px" }} />
          <Column field="estado" header="Estado" body={estadoTemplate} sortable style={{ minWidth: "140px" }} />
          <Column header="Acción" body={accionesTemplate} style={{ minWidth: "140px", textAlign: "right" }} />
        </DataTable>
      </div>

      {/* Modal de Registro de Consulta y Diagnóstico */}
      <Dialog
        visible={modalConsulta}
        onHide={() => setModalConsulta(false)}
        header={
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 text-lg">
              <i className="pi pi-stethoscope" />
            </div>
            <div>
              <span className="text-base font-bold font-display text-slate-900 block leading-tight">
                Expediente y Atención Médica
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>Cita <strong className="text-slate-700">#{citaSeleccionada?.id}</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Listo para consulta
                </span>
              </span>
            </div>
          </div>
        }
        style={{ width: "720px" }}
        modal
        className="p-fluid"
      >
        <div className="space-y-5 pt-1">
          {/* Ficha Resumen del Paciente y Cita */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {getIniciales(citaSeleccionada?.pacienteNombre)}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {citaSeleccionada?.pacienteNombre || "Paciente no especificado"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ID Paciente: #{citaSeleccionada?.pacienteId || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                  <i className="pi pi-calendar text-blue-600 text-[11px]" />
                  <span className="font-semibold">{citaSeleccionada?.fecha || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                  <i className="pi pi-clock text-blue-600 text-[11px]" />
                  <span className="font-semibold">{citaSeleccionada?.horaInicio?.slice(0, 5) || "—"}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Motivo de Consulta Declarado
              </span>
              <p className="text-xs text-slate-700 font-medium mt-0.5 m-0 bg-white p-2.5 rounded-xl border border-slate-200/60">
                {citaSeleccionada?.motivo || "Sin motivo registrado"}
              </p>
            </div>
          </div>

          {/* Formulario Clínico */}
          <div className="space-y-4">
            {/* Diagnóstico */}
            <div>
              <div className="flex items-center mb-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <i className="pi pi-file-edit text-blue-600 text-sm" />
                  <span>Diagnóstico Clínico</span>
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <InputTextarea
                value={consulta.diagnostico}
                onChange={(e) => setConsulta({ ...consulta, diagnostico: e.target.value })}
                rows={3}
                placeholder="Ingresa la evaluación médica, diagnóstico presuntivo o definitivo..."
                className="text-xs rounded-xl w-full p-3 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                autoResize
              />
            </div>

            {/* Tratamiento y Receta Médica */}
            <div>
              <div className="flex items-center mb-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <i className="pi pi-heart text-emerald-600 text-sm" />
                  <span>Tratamiento y Receta Médica</span>
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <InputTextarea
                value={consulta.tratamiento}
                onChange={(e) => setConsulta({ ...consulta, tratamiento: e.target.value })}
                rows={3}
                placeholder="Fármacos recetados, posología (dosis/frecuencia), duración y cuidados recomendados..."
                className="text-xs rounded-xl w-full p-3 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                autoResize
              />
            </div>

            {/* Observaciones o Próxima Cita */}
            <div>
              <div className="flex items-center mb-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <i className="pi pi-info-circle text-slate-500 text-sm" />
                  <span>Observaciones Adicionales / Control</span>
                  <span className="text-slate-400 text-xs font-normal">(Opcional)</span>
                </label>
              </div>
              <InputTextarea
                value={consulta.nota}
                onChange={(e) => setConsulta({ ...consulta, nota: e.target.value })}
                rows={2}
                placeholder="Recomendaciones de estilo de vida, estudios de laboratorio complementarios o fecha estimada de control..."
                className="text-xs rounded-xl w-full p-3 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                autoResize
              />
            </div>
          </div>

          {/* Botones de acción inferiores */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={() => setModalConsulta(false)}
              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-xs"
            />
            <Button
              label="Finalizar y Guardar Consulta"
              icon="pi pi-check"
              loading={saving}
              onClick={handleFinalizarConsulta}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 border-none transition-all"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}