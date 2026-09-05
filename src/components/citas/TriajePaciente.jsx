import { useState, useEffect, useRef, useMemo } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { citaService } from "../../services/citaService";
import { consultaService } from "../../services/consultaService";
import { mostrarExitoApi, mostrarErrorApi, mostrarAdvertenciaApi } from "../../utils/alertasApi";

const ESTADO_CONFIG = {
    PENDIENTE: { label: "Falta Triaje", icon: "pi-clock", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    EN_ESPERA: { label: "En Espera del Doctor", icon: "pi-check", bg: "bg-sky-50 text-sky-700 border-sky-200" },
    ATENDIDA: { label: "Atendida", icon: "pi-check-circle", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELADA: { label: "Cancelada", icon: "pi-times-circle", bg: "bg-red-50 text-red-700 border-red-200" },
    REASIGNADA: { label: "Reasignada", icon: "pi-refresh", bg: "bg-purple-50 text-purple-700 border-purple-200" },
};

const getIniciales = (nombre) => {
    if(!nombre) return "P";
    return nombre.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function TirajePaciente(){
    const toast = useRef(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");

    //Modal tiraje
    const [modalTriaje, setModalTriaje] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [saving, setSaving] = useState(false);

    const [triaje, setTriaje] = useState({
        tirajePa: "",
        tirajeTemperatura: null,
        tirajePeso: null,
        tirajeEstatura: null,
        tirajeSintomas: "",
        nota: "",
    });

    useEffect(() => {
        cargarCitas();
    }, []);

    const cargarCitas = async() => {
        setLoading(true);
        try{
            const data = await citaService.obtenerTodas();
            setCitas(data || []);
        }catch(err){
            mostrarErrorApi(toast, err, "Error al cargar las citas para triaje.");
        }finally{
            setLoading(false);
        }
    }

    const metricas = useMemo(() => {
        const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
        const enEspera = citas.filter((c) => c.estado === "EN_ESPERA").length;
        return { pendientes, enEspera, total: citas.length };
    }, [citas]);

    const citasFiltradas = useMemo(() => {
        if(filtroEstado === "TODOS") return citas;
        return citas.filter((c) => c.estado === filtroEstado);
    }, [citas, filtroEstado]);

    const abrirModalTiraje = (cita) => {
        setCitaSeleccionada(cita);
        setTriaje({
          tirajePa: "",
          tirajeTemperatura: null,
          tirajePeso: null,
          tirajeEstatura: null,
          tirajeSintomas: cita?.motivo || "",
          nota: "",
        });
        setModalTriaje(true);
    }

    const handleGuardarTiraje = async () => {
        if(!triaje.tirajePa.trim()){
            mostrarAdvertenciaApi(toast, "La Presión Arterial es obligatoria.");
            return;
        }
        if(!triaje.tirajeTemperatura){
            mostrarAdvertenciaApi(toast, "La temperatura es obligatoria.");
            return;
        }
        if(!triaje.tirajePeso){
            mostrarAdvertenciaApi(toast, "El peso es obligatorio.");
            return;
        }
        if(!triaje.tirajeEstatura){
            mostrarAdvertenciaApi(toast, "La estatura es obligatoria.");
            return;
        }
        if(!triaje.tirajeSintomas.trim()){
            mostrarAdvertenciaApi(toast, "Los síntomas del paciente son obligatorios.");
            return;
        }

        setSaving(true);
        try{
            const payload = {
            citaId: citaSeleccionada.id,
            pacienteId: citaSeleccionada.pacienteId,
            tirajePa: triaje.tirajePa,
            tirajeTemperatura: triaje.tirajeTemperatura,
            tirajePeso: triaje.tirajePeso,
            tirajeEstatura: triaje.tirajeEstatura,
            tirajeSintomas: triaje.tirajeSintomas,
            nota: triaje.nota,
          };

          const res = await consultaService.registrarTiraje(payload);
          mostrarExitoApi(toast, res?.message || "Signos vitales registrados con éxito. Paciente listo para la consulta.");
          setModalTriaje(false);
          cargarCitas();
        }catch(err){
            mostrarErrorApi(toast, err, "Error al guardar el triaje.");
        }finally{
            setSaving(false);
        }
    }

    const pacienteTemplate = (rowData) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {getIniciales(rowData.pacienteNombre)}
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 block">{rowData.pacienteNombre}</span>
            <span className="text-xs text-slate-400">Dr(a). {rowData.doctorNombre || "Médico"}</span>
          </div>
        </div>
    );
    const horaTemplate = (rowData) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
          <i className="pi pi-clock text-[10px] text-blue-600" />
          <span>{rowData.horaInicio ? rowData.horaInicio.slice(0, 5) : "—"}</span>
        </div>
    );
    const estadoTemplate = (rowData) => {
        const config = ESTADO_CONFIG[rowData.estado] || { label: rowData.estado, icon: "pi-circle", 
            bg: "bg-slate-50 text-slate-700 border-slate-200" };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg}`}>
            <i className={`pi ${config.icon} text-[10px]`} />
            <span>{config.label}</span>
          </span>
        );
    };
    const accionesTemplate = (rowData) => {
        const esHoy = rowData.fecha === new Date().toISOString().split("T")[0];

        return (
          <div className="flex items-center justify-end">
            {rowData.estado === "PENDIENTE" ? (
              esHoy ? (
                <Button
                  label="Tomar Signos"
                  icon="pi pi-heart"
                  size="small"
                  onClick={() => abrirModalTiraje(rowData)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-sm border-none transition-all cursor-pointer"
                />
              ) : (
                <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                  <i className="pi pi-calendar text-[10px]" />
                  <span>Cita de otra fecha</span>
                </span>
              )
            ) : (
              <span className="text-xs text-slate-400 italic">Triaje completado</span>
            )}
          </div>
        );
    };
    const header = (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "PENDIENTE", label: "Falta Triaje", icon: "pi-clock" },
              { key: "EN_ESPERA", label: "En Espera del Doctor", icon: "pi-check" },
              { key: "TODOS", label: "Todas las Citas", icon: "pi-list" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFiltroEstado(f.key)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer border ${
                  filtroEstado === f.key
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 border-transparent"
                    : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200/80 shadow-xs"
                }`}
              >
                <i className={`pi ${f.icon} text-xs`} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-
  none" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por paciente, motivo..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white
  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300
  text-slate-600 flex items-center justify-center text-[9px] border-none cursor-pointer"
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
          <div>
            <h2 className="text-xl font-display font-extrabold text-slate-900 m-0">
              Estación de Triaje y Signos Vitales
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 m-0">
              Recepción de pacientes, toma de parámetros vitales y pase a consulta médica
            </p>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 md:p-6 space-y-4">
            <DataTable
              value={citasFiltradas}
              loading={loading}
              header={header}
              globalFilter={globalFilter}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 20]}
              emptyMessage="No hay citas en este estado."
              sortField="fecha"
              sortOrder={1}
              stripedRows
              className="text-xs"
            >
              <Column field="pacienteNombre" header="Paciente" body={pacienteTemplate} sortable style={{ minWidth: "220px"
  }} />
              <Column field="horaInicio" header="Hora" body={horaTemplate} sortable style={{ minWidth: "90px" }} />
              <Column field="motivo" header="Motivo Cita" style={{ minWidth: "200px" }} />
              <Column field="especialidadNombre" header="Especialidad" sortable style={{ minWidth: "140px" }} />
              <Column field="estado" header="Estado" body={estadoTemplate} sortable style={{ minWidth: "140px" }} />
              <Column header="Acción" body={accionesTemplate} style={{ minWidth: "140px", textAlign: "right" }} />
            </DataTable>
          </div>

          {/* Modal de Toma de Signos Vitales */}
          <Dialog
            visible={modalTriaje}
            onHide={() => setModalTriaje(false)}
            header={
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20 text-xl">
                  <i className="pi pi-heart-fill" />
                </div>
                <div>
                  <span className="text-lg font-bold font-display text-slate-900 block leading-tight">
                    Toma de Signos Vitales (Triaje)
                  </span>
                  <span className="text-sm text-slate-500 mt-0.5 block">
                    Paciente: <strong className="text-slate-800 font-bold">{citaSeleccionada?.pacienteNombre}</strong>
                  </span>
                </div>
              </div>
            }
            style={{ width: "720px" }}
            modal
            className="p-fluid"
          >
            <div className="space-y-5 pt-2">
              {/* Ficha Resumen */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200/80 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Doctor Asignado</span>
                  <span className="font-extrabold text-slate-800 text-sm block mt-0.5">Dr(a). {citaSeleccionada?.doctorNombre || "Médico"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Especialidad</span>
                  <span className="font-extrabold text-blue-600 text-sm block mt-0.5">{citaSeleccionada?.especialidadNombre || "Medicina General"}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hora de Cita</span>
                  <span className="font-extrabold text-slate-800 text-sm block mt-0.5">{citaSeleccionada?.horaInicio?.slice(0, 5)}</span>
                </div>
              </div>

              {/* Cuadrícula de Signos Vitales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1.5">
                    Presión (PA) <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={triaje.tirajePa}
                    onChange={(e) => setTriaje({ ...triaje, tirajePa: e.target.value })}
                    placeholder="120/80"
                    className="text-sm py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-cyan-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1.5">
                    Temp (°C) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    value={triaje.tirajeTemperatura}
                    onValueChange={(e) => setTriaje({ ...triaje, tirajeTemperatura: e.value })}
                    mode="decimal"
                    minFractionDigits={1}
                    maxFractionDigits={1}
                    placeholder="36.5"
                    min={30}
                    max={45}
                    className="text-sm rounded-xl"
                    inputClassName="text-sm py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1.5">
                    Peso (kg) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    value={triaje.tirajePeso}
                    onValueChange={(e) => setTriaje({ ...triaje, tirajePeso: e.value })}
                    mode="decimal"
                    minFractionDigits={1}
                    maxFractionDigits={2}
                    placeholder="70.5"
                    className="text-sm rounded-xl"
                    inputClassName="text-sm py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1.5">
                    Estatura (m) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    value={triaje.tirajeEstatura}
                    onValueChange={(e) => setTriaje({ ...triaje, tirajeEstatura: e.value })}
                    mode="decimal"
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    placeholder="1.70"
                    className="text-sm rounded-xl"
                    inputClassName="text-sm py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white font-medium"
                  />
                </div>
              </div>

              {/* Síntomas del Paciente */}
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1.5">
                  Síntomas y Motivo de Consulta <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  value={triaje.tirajeSintomas}
                  onChange={(e) => setTriaje({ ...triaje, tirajeSintomas: e.target.value })}
                  rows={3}
                  placeholder="Describa los síntomas reportados por el paciente..."
                  className="text-sm rounded-xl w-full p-3.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium leading-relaxed"
                  autoResize
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  onClick={() => setModalTriaje(false)}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-xs cursor-pointer"
                />
                <Button
                  label="Enviar a Sala de Espera"
                  icon="pi pi-check"
                  loading={saving}
                  onClick={handleGuardarTiraje}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20 border-none transition-all cursor-pointer"
                />
              </div>
            </div>
          </Dialog>
        </div>
    )
}
