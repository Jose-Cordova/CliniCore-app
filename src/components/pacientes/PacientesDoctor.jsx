import { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useAuth } from "../../auth/AuthContext";
import { pacienteService } from "../../services/pacienteService";
import { consultaService } from "../../services/consultaService";
import { mostrarErrorApi } from "../../utils/alertasApi";

const getIniciales = (nombre, apellido) => {
    const n = (nombre || "P").charAt(0);
    const a = (apellido || "").charAt(0);
    return (n + a).toUpperCase();
}

const calcularEdad = (fechaNac) => {
    if(!fechaNac) return "-";
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if(m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return `${edad} años`;
}

export default function PacientesDoctor(){
    const { usuario } = useAuth();
    const esPersonal = usuario?.rol === "PERSONAL";
    const toast = useRef(null);

    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");

    //Modal expediente
    const [modalExpediente, setModalExpediente] = useState(false);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [consultasHistorial, setConsultasHistorial] = useState([]);
    const [loadingExpediente, setLoadingExpediente] = useState(false);

    useEffect(() => {
        cargarPacientes();
    }, []);

    const cargarPacientes = async () => {
        setLoading(true);
        try{
            const data = await pacienteService.obtenerTodos();
            setPacientes(data || []);
        }catch(err){
            mostrarErrorApi(toast, err, "Error al cargar el directorio de pacientes.");
        }finally{
            setLoading(false);
        }
    }

    //Abrir expediente y cargar historial clinico de consultas
    const handleVerExpediente = async (paciente) => {
        setPacienteSeleccionado(paciente);
        setModalExpediente(true);
        setLoadingExpediente(true);
        try{
            const historial = await consultaService.obtenerExpediente(paciente.id);
            setConsultasHistorial(historial || []);
        }catch(err){
            mostrarErrorApi(toast, err, "Error al cargar el historial del expediente.");
            setConsultasHistorial([]);
        }finally{
            setLoadingExpediente(false);
        }

    }

    //Templates de columnas
    const pacienteTemplate = (rowData) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {getIniciales(rowData.nombre, rowData.apellido)}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block">
              {rowData.nombre} {rowData.apellido}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Exp: <strong className="text-slate-700 font-mono text-xs">{rowData.codigoExpediente || "SIN CODIGO"}</strong>
            </span>
          </div>
        </div>
    );
    const edadGeneroTemplate = (rowData) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800">{calcularEdad(rowData.fechaNacimiento)}</span>
          <span className="text-xs text-slate-500 font-medium capitalize">{rowData.genero || "No especificado"}</span>
        </div>
    );
    const contactoTemplate = (rowData) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <i className="pi pi-phone text-xs text-blue-600" />
            {rowData.telefono || "—"}
          </span>
          <span className="text-xs text-slate-600 font-mono font-medium">DUI: {rowData.dui || "—"}</span>
        </div>
    );
    const alergiasTemplate = (rowData) => {
        if(!rowData.alergiaIntolerancia || rowData.alergiaIntolerancia.toLowerCase() === "ninguna"){
            return <span className="text-xs text-slate-400 italic">Ninguna</span>;
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50
  text-amber-700 border border-amber-200">
            <i className="pi pi-exclamation-triangle text-[9px]" />
            {rowData.alergiaIntolerancia}
          </span>
        );
    }
    const estadoTemplate = (rowData) => (
        <Tag
          value={rowData.archivado ? "ARCHIVADO" : "ACTIVO"}
          severity={rowData.archivado ? "danger" : "success"}
          className="text-[10px] font-bold px-2 py-0.5"
        />
    );
    const accionesTemplate = (rowData) => (
        <Button
          label="Expediente"
          icon="pi pi-folder-open"
          size="small"
          onClick={() => handleVerExpediente(rowData)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-
  700 hover:to-indigo-700 text-white shadow-sm border-none transition-all"
        />
    );
    const header = (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">Directorio de Pacientes</h3>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Consulta expedientes, antecedentes clínicos e historial de atenciones médicas
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nombre, DUI, exp..."
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
        </div>
    );

    return (
        <div className="space-y-6">
          <Toast ref={toast} />

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-900 m-0">
                Pacientes y Expedientes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 m-0">
                Historial clínico integral de pacientes atendidos en CliniCore
              </p>
            </div>
          </div>

          {/* Tabla Principal */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 md:p-6">
            <DataTable
              value={pacientes}
              loading={loading}
              header={header}
              globalFilter={globalFilter}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 20]}
              emptyMessage="No se encontraron pacientes registrados."
              sortField="nombre"
              sortOrder={1}
              stripedRows
              className="text-xs"
            >
              <Column field="nombre" header="Paciente" body={pacienteTemplate} sortable style={{ minWidth: "220px" }} />
              <Column header="Edad / Género" body={edadGeneroTemplate} style={{ minWidth: "120px" }} />
              <Column header="Contacto" body={contactoTemplate} style={{ minWidth: "140px" }} />
              <Column field="alergiaIntolerancia" header="Alergias / Intolerancias" body={alergiasTemplate} style={{
  minWidth: "160px" }} />
              <Column field="archivado" header="Estado" body={estadoTemplate} sortable style={{ minWidth: "100px" }} />
              <Column header="Acción" body={accionesTemplate} style={{ minWidth: "130px", textAlign: "right" }} />
            </DataTable>
          </div>

          {/* Modal / Expediente Clínico Completo */}
          <Dialog
            visible={modalExpediente}
            onHide={() => setModalExpediente(false)}
            header={
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white
  flex items-center justify-center shadow-md shadow-blue-500/20 text-lg">
                  <i className="pi pi-book" />
                </div>
                <div>
                  <span className="text-base font-bold font-display text-slate-900 block leading-tight">
                    Expediente Clínico Electrónico
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Código: <strong className="text-slate-800 font-mono">{pacienteSeleccionado?.
  codigoExpediente}</strong></span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">{pacienteSeleccionado?.nombre} {pacienteSeleccionado?.
  apellido}</span>
                  </span>
                </div>
              </div>
            }
            style={{ width: "820px" }}
            modal
            className="p-fluid"
          >
            <div className="space-y-4 pt-1">
              {/* Historial de Consultas Realizadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 m-0 flex items-center gap-2">
                    <i className="pi pi-history text-blue-600" />
                    Historial de Consultas y Diagnósticos ({consultasHistorial.length})
                  </h4>
                </div>

                {loadingExpediente ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <i className="pi pi-spin pi-spinner text-2xl text-blue-600 mb-2" />
                    <span className="text-xs">Cargando historial clínico...</span>
                  </div>
                ) : consultasHistorial.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
                    <i className="pi pi-folder-open text-3xl text-slate-300" />
                    <p className="text-xs text-slate-500 m-0">Este paciente aún no tiene consultas médicas registradas.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {consultasHistorial.map((c, index) => (
                      <div
                        key={c.id || index}
                        className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5"
                      >
                        {/* Encabezado de la consulta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <i className="pi pi-calendar text-blue-600 text-sm" />
                            <span className="text-sm font-bold text-slate-800">
                              {c.fechaAtencion ? new Date(c.fechaAtencion).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "Fecha no registrada"}
                            </span>
                          </div>
                          <span className="text-xs text-slate-600 font-medium">
                            Atendido por: <strong className="text-slate-800 font-bold">Dr(a). {c.doctorNombre || "Médico"}</strong>
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
                            <strong className="text-slate-800 text-xs sm:text-sm">{c.tirajeTemperatura ? `${c.tirajeTemperatura}°C` : "—"}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Peso</span>
                            <strong className="text-slate-800 text-xs sm:text-sm">{c.tirajePeso ? `${c.tirajePeso} kg` : "—"}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Estatura</span>
                            <strong className="text-slate-800 text-xs sm:text-sm">{c.tirajeEstatura ? `${c.tirajeEstatura} m` : "—"}</strong>
                          </div>
                        </div>

                        {/* Diagnóstico y Tratamiento (Solo visible para DOCTOR y ADMIN) */}
                        {!esPersonal ? (
                          <>
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
                          </>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-500 italic">
                            <i className="pi pi-lock text-slate-400 text-xs" />
                            <span>Diagnóstico y Tratamiento reservados para el médico tratante.</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de cierre */}
              <div className="flex justify-end pt-3 border-t border-slate-200/80">
                <Button
                  label="Cerrar Expediente"
                  icon="pi pi-times"
                  onClick={() => setModalExpediente(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-xs cursor-pointer"
                />
              </div>
            </div>
          </Dialog>
        </div>
    );

}