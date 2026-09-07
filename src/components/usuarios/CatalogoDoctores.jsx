import { useState, useEffect, useRef, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import doctorService from "../../services/doctorService";
import consultaService from "../../services/consultaService";
import { listarEspecialidades } from "../../services/especialidadesService";
import { mostrarErrorApi } from "../../utils/alertasApi";

const getIniciales = (nombre, apellido) => {
    const n = (nombre || "D").charAt(0);
    const a = (apellido || "").charAt(0);
    return (n + a).toUpperCase();
}

export default function CatalogoDoctores(){
    const toast = useRef(null);
    const [doctores, setDoctores] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroGlobal, setFiltroGlobal] = useState("");

    // Modal para ver las consultas atendidas por el doctor
    const [modalConsultas, setModalConsultas] = useState(false);
    const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
    const [consultasDoctor, setConsultasDoctor] = useState([]);
    const [cargandoConsultas, setCargandoConsultas] = useState(false);

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
    }

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

    const abrirConsultasDoctor = async (doc) => {
        setDoctorSeleccionado(doc);
        setModalConsultas(true);
        setCargandoConsultas(true);
        setConsultasDoctor([]);

        try {
            const data = await consultaService.obtenerConsultasPorDoctor(doc.id);
            setConsultasDoctor(data || []);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron cargar las consultas del doctor");
        } finally {
            setCargandoConsultas(false);
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
            icon="pi pi-history"
            label="Ver Consultas"
            onClick={() => abrirConsultasDoctor(rowData)}
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
              Directorio de médicos especialistas y registro de consultas atendidas
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

          {/* Modal Historial de Consultas Atendidas por el Doctor */}
          <Dialog
            visible={modalConsultas}
            onHide={() => setModalConsultas(false)}
            header={
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 text-base font-black shrink-0">
                  {getIniciales(doctorSeleccionado?.nombre, doctorSeleccionado?.apellido)}
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold font-display text-slate-900 block leading-tight">
                    Consultas Atendidas - Dr(a). {doctorSeleccionado?.nombre} {doctorSeleccionado?.apellido}
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
                  onClick={() => setModalConsultas(false)}
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
              {cargandoConsultas ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <i className="pi pi-spin pi-spinner text-3xl text-blue-600" />
                  <span className="text-xs font-medium">Cargando consultas atendidas...</span>
                </div>
              ) : consultasDoctor.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
                  <i className="pi pi-folder-open text-3xl text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700 m-0">Sin consultas registradas</p>
                  <p className="text-xs text-slate-500 m-0">Este médico aún no tiene consultas médicas atendidas en el sistema.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Historial de Consultas Realizadas
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      Total: {consultasDoctor.length} consultas
                    </span>
                  </div>

                  {consultasDoctor.map((c, index) => (
                    <div
                      key={c.id || index}
                      className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5"
                    >
                      {/* Encabezado de la consulta */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <i className="pi pi-calendar text-blue-600 text-sm" />
                          <span className="text-sm font-bold text-slate-800">
                            {c.fechaAtencion
                              ? new Date(c.fechaAtencion).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "Fecha no registrada"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          Paciente: <strong className="text-slate-800 font-bold">{c.pacienteNombre || "Paciente"}</strong>
                        </span>
                      </div>

                      {/* Signos vitales (Triaje) */}
                      <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl text-center">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Presión</span>
                          <strong className="text-slate-800 text-xs sm:text-sm">{c.tirajePa || "—"}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Temperatura</span>
                          <strong className="text-slate-800 text-xs sm:text-sm">
                            {c.tirajeTemperatura ? `${c.tirajeTemperatura}°C` : "—"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Peso</span>
                          <strong className="text-slate-800 text-xs sm:text-sm">
                            {c.tirajePeso ? `${c.tirajePeso} kg` : "—"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Estatura</span>
                          <strong className="text-slate-800 text-xs sm:text-sm">
                            {c.tirajeEstatura ? `${c.tirajeEstatura} m` : "—"}
                          </strong>
                        </div>
                      </div>

                      {/* Diagnóstico */}
                      <div>
                        <span className="text-xs font-bold text-blue-900 block mb-1 flex items-center gap-1.5">
                          <i className="pi pi-file-edit text-blue-600 text-xs" />
                          Diagnóstico Clínico:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 m-0 bg-blue-50/50 p-3 rounded-xl border border-blue-100/70 font-medium leading-relaxed">
                          {c.diagnostico}
                        </p>
                      </div>

                      {/* Tratamiento */}
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                          <i className="pi pi-heart text-emerald-600 text-xs" />
                          Tratamiento y Receta Médica:
                        </span>
                        <p className="text-xs sm:text-sm text-slate-800 m-0 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/70 font-medium leading-relaxed whitespace-pre-line">
                          {c.tratamiento}
                        </p>
                      </div>

                      {/* Nota */}
                      {c.nota && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                          <strong className="text-slate-700">Nota / Control:</strong> {c.nota}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Dialog>
        </div>
    );
}