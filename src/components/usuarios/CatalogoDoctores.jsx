import { useState, useEffect, useRef, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import doctorService from "../../services/doctorService";
import citaService from "../../services/citaService";
import { listarEspecialidades } from "../../services/especialidadesService";
import { mostrarErrorApi } from "../../utils/alertasApi";

const ESTADO_CITA_CONFIG = {
  PENDIENTE: { label: "Pendiente", icon: "pi-clock", style: "bg-amber-50 text-amber-700 border-amber-200" },
  RESERVADA: { label: "Reservada", icon: "pi-calendar", style: "bg-blue-50 text-blue-700 border-blue-200" },
  EN_ESPERA: { label: "En Espera", icon: "pi-hourglass", style: "bg-sky-50 text-sky-700 border-sky-200" },
  ATENDIDA: { label: "Atendida", icon: "pi-check-circle", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELADA: { label: "Cancelada", icon: "pi-times-circle", style: "bg-red-50 text-red-700 border-red-200" },
  REASIGNADA: { label: "Reasignada", icon: "pi-refresh", style: "bg-purple-50 text-purple-700 border-purple-200" },
};

const getIniciales = (nombre, apellido) => {
    const n = (nombre || "D").charAt(0);
    const a = (apellido || "").charAt(0);
    return (n + a).toUpperCase();
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "Fecha no registrada";
  try {
    const partes = String(fechaStr).split("-");
    if (partes.length === 3) {
      const fechaObj = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      return fechaObj.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    return new Date(fechaStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return fechaStr;
  }
};

const formatearHora = (hora) => {
  if (!hora) return "";
  return String(hora).substring(0, 5);
};

export default function CatalogoDoctores(){
    const toast = useRef(null);
    const [doctores, setDoctores] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroGlobal, setFiltroGlobal] = useState("");

    // Modal para ver las citas asignadas al doctor
    const [modalCitas, setModalCitas] = useState(false);
    const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
    const [citasDoctor, setCitasDoctor] = useState([]);
    const [cargandoCitas, setCargandoCitas] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try{
            const [dataDoctores, dataEspecialidades] = await Promise.all([
                doctorService.listarTodos(),
                listarEspecialidades().catch(() => [])
            ]);
            setDoctores(dataDoctores || []);
            setEspecialidades(dataEspecialidades || []);
        }catch(error){
            mostrarErrorApi(toast, error, "No se pudieron cargar los doctores");
        }finally{
            setCargando(false);
        }
    };

    // Mapa para vincular rápidamente el id de la especialidad con el nombre
    const mapaEspecialidades = useMemo(() => {
        const map = {};
        especialidades.forEach((esp) => {
            map[esp.id] = esp.nombre;
        });
        return map;
    }, [especialidades]);

    const doctoresConEspecialidad = useMemo(() => {
        return doctores.map((doc) => ({
            ...doc,
            especialidadNombre: mapaEspecialidades[doc.especialidadId] || "Medicina General"
        }));
    }, [doctores, mapaEspecialidades]);

    const abrirCitasDoctor = async (doc) => {
        setDoctorSeleccionado(doc);
        setModalCitas(true);
        setCargandoCitas(true);
        setCitasDoctor([]);

        try {
            const data = await citaService.obtenerPorDoctor(doc.id);
            setCitasDoctor(data || []);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron cargar las citas del doctor");
        } finally {
            setCargandoCitas(false);
        }
    };

    // Templates de la tabla
    const doctorTemplate = (rowData) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            {getIniciales(rowData.nombre, rowData.apellido)}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              Dr(a). {rowData.nombre} {rowData.apellido}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Cód: {rowData.codigo || "—"}
            </span>
          </div>
        </div>
    );

    const especialidadTemplate = (rowData) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
          <i className="pi pi-bookmark text-[10px]" />
          <span>{rowData.especialidadNombre}</span>
        </span>
    );

    const contactoTemplate = (rowData) => (
        <div className="space-y-0.5 text-xs">
          <div className="text-slate-700 flex items-center gap-1.5 font-medium">
            <i className="pi pi-envelope text-slate-400 text-xs" />
            <span>{rowData.email || "—"}</span>
          </div>
          <div className="text-slate-500 flex items-center gap-1.5">
            <i className="pi pi-phone text-slate-400 text-xs" />
            <span>{rowData.telefono || "—"}</span>
          </div>
        </div>
    );

    const accionesTemplate = (rowData) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            icon="pi pi-calendar"
            label="Ver Citas"
            onClick={() => abrirCitasDoctor(rowData)}
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all cursor-pointer"
          />
        </div>
    );

    const header = (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1">
          <div className="relative w-full sm:w-80">
            <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <InputText
              value={filtroGlobal}
              onChange={(e) => setFiltroGlobal(e.target.value)}
              placeholder="Buscar doctor, código, email..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
            />
            {filtroGlobal && (
              <button
                onClick={() => setFiltroGlobal("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[9px] border-none cursor-pointer"
              >
                <i className="pi pi-times" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              Total: <strong className="text-slate-800">{doctores.length}</strong> médicos
            </span>
          </div>
        </div>
    );

    return (
        <div className="space-y-6">
          <Toast ref={toast} />

          {/* Encabezado */}
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 m-0">
              Catálogo del Cuerpo Médico
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              Directorio de médicos especialistas y registro de citas asignadas
            </p>
          </div>

          {/* Tabla de Doctores */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 md:p-6 space-y-4">
            <DataTable
              value={doctoresConEspecialidad}
              loading={cargando}
              header={header}
              globalFilter={filtroGlobal}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 20]}
              emptyMessage="No se encontraron doctores registrados."
              sortField="nombre"
              sortOrder={1}
              stripedRows
              className="text-xs"
            >
              <Column header="Doctor" body={doctorTemplate} sortable field="nombre" style={{ minWidth: "240px" }} />
              <Column header="Especialidad" body={especialidadTemplate} sortable field="especialidadNombre" style={{ minWidth: "180px" }} />
              <Column header="Contacto" body={contactoTemplate} style={{ minWidth: "220px" }} />
              <Column header="Acciones" body={accionesTemplate} style={{ minWidth: "150px", textAlign: "right" }} />
            </DataTable>
          </div>

          {/* Modal Historial de Citas del Doctor */}
          <Dialog
            visible={modalCitas}
            onHide={() => setModalCitas(false)}
            header={
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 text-base font-black shrink-0">
                  {getIniciales(doctorSeleccionado?.nombre, doctorSeleccionado?.apellido)}
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block leading-tight">
                    Citas del Dr(a). {doctorSeleccionado?.nombre} {doctorSeleccionado?.apellido}
                  </span>
                  <span className="text-xs sm:text-sm text-blue-600 font-semibold mt-0.5 block">
                    {doctorSeleccionado?.especialidadNombre} • Cód: {doctorSeleccionado?.codigo || "—"}
                  </span>
                </div>
              </div>
            }
            footer={
              <div className="w-full">
                <Button
                  onClick={() => setModalCitas(false)}
                  className="relative w-full h-11 px-5 text-sm font-bold rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all flex items-center justify-center shadow-xs cursor-pointer"
                >
                  <i className="pi pi-times absolute left-4 sm:left-5 text-sm" />
                  <span>Cerrar</span>
                </Button>
              </div>
            }
            style={{ width: "740px", maxWidth: "95vw" }}
            modal
            className="p-fluid"
          >
            <div className="space-y-4 pt-2">
              {cargandoCitas ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <i className="pi pi-spin pi-spinner text-3xl text-blue-600" />
                  <span className="text-xs font-medium">Cargando citas del doctor...</span>
                </div>
              ) : citasDoctor.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
                  <i className="pi pi-calendar-times text-3xl text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 m-0">Sin citas registradas</p>
                  <p className="text-xs text-slate-500 m-0">Este médico aún no tiene citas asignadas o registradas en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Historial de Citas Médicas
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      Total: {citasDoctor.length} citas
                    </span>
                  </div>

                  {citasDoctor.map((c, index) => {
                    const estadoConfig = ESTADO_CITA_CONFIG[c.estado] || {
                      label: c.estado || "General",
                      icon: "pi-circle-fill",
                      style: "bg-slate-50 text-slate-700 border-slate-200",
                    };

                    return (
                      <div
                        key={c.id || index}
                        className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3"
                      >
                        {/* Fila superior: Fecha, Horario y Badge de Estado */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800">
                              <i className="pi pi-calendar text-blue-600 text-xs" />
                              <span>{formatearFecha(c.fecha)}</span>
                            </div>
                            {(c.horaInicio || c.horaFin) && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                                <i className="pi pi-clock text-[10px]" />
                                <span>
                                  {formatearHora(c.horaInicio)}
                                  {c.horaFin ? ` - ${formatearHora(c.horaFin)}` : ""}
                                </span>
                              </div>
                            )}
                          </div>

                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${estadoConfig.style}`}>
                            <i className={`pi ${estadoConfig.icon} text-[10px]`} />
                            <span>{estadoConfig.label}</span>
                          </span>
                        </div>

                        {/* Paciente */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                              <i className="pi pi-user text-xs" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Paciente Asignado</span>
                              <strong className="text-slate-800 font-bold text-xs sm:text-sm">
                                {c.pacienteNombre || "Paciente no especificado"}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Motivo de consulta */}
                        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-600 block mb-0.5">Motivo de la Cita:</span>
                          <p className="text-xs text-slate-700 m-0 font-medium">
                            {c.motivo || "Consulta médica general."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog>
        </div>
    );
}