import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useAuth } from "../../auth/AuthContext";
import { citaService } from "../../services/citaService";

const getIniciales = (nombre) => {
    if(!nombre) return "P";
    return nombre.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase();
}

export default function DashboardPersonal(){
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);

    const hoy = new Date();

    useEffect(() => {
        cargarCitas();
    }, []);

    const cargarCitas = async () => {
        setLoading(true);
        try{
            const data = await citaService.obtenerTodas();
            setCitas(data || []);
        }catch{
            setCitas([]);
        }finally{
            setLoading(false);
        }
    }

    const metricas = useMemo(() => {
        const pendientes = citas.filter((c) => c.estado === "PENDIENTE").length;
        const enEspera = citas.filter((c) => c.estado === "EN_ESPERA").length;
        const atendidas = citas.filter((c) => c.estado === "ATENDIDA").length;
        return { pendientes, enEspera, atendidas, total: citas.length };
    }, [citas]);

    const proximosPacientes = useMemo(() => {
        return citas.filter((c) => c.estado === "PENDIENTE" || c.estado === "EN_ESPERA").slice(0, 5);
    }, [citas]);

    return (
        <div className="space-y-6">
          {/* Banner de Bienvenida */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sidebar to-slate-900 text-white shadow-soft-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold">
                  <i className="pi pi-calendar text-xs" />
                  <span className="capitalize">
                    {hoy.toLocaleDateString("es-ES", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  Bienvenida, <span className="text-cyan-300">{usuario?.nombre || "Enfermería"}</span>
                </h1>

                <p className="text-slate-400 text-sm max-w-xl">
                  Panel de control de enfermería para triaje, toma de signos vitales y preparación de pacientes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  label="Iniciar Triaje"
                  icon="pi pi-heart"
                  onClick={() => navigate("/triaje")}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-md shadow-cyan-500/20 border-none transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Grid de Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pendientes de Triaje */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-amber-300 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pendientes Triaje
                </span>
                <div className="text-2xl font-extrabold text-amber-600">
                  {loading ? "..." : metricas.pendientes}
                </div>
                <span className="text-xs text-amber-700 font-semibold block">Requieren toma de signos</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center text-xl shadow-xs shrink-0">
                <i className="pi pi-clock" />
              </div>
            </div>

            {/* Listos para Doctor */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-sky-300 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Listos para Doctor
                </span>
                <div className="text-2xl font-extrabold text-sky-600">
                  {loading ? "..." : metricas.enEspera}
                </div>
                <span className="text-xs text-sky-700 font-semibold block">Triaje completado</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center text-xl shadow-xs shrink-0">
                <i className="pi pi-check-circle" />
              </div>
            </div>

            {/* Atendidas */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-emerald-300 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Atendidas
                </span>
                <div className="text-2xl font-extrabold text-emerald-600">
                  {loading ? "..." : metricas.atendidas}
                </div>
                <span className="text-xs text-slate-500 font-medium block">Finalizadas hoy</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl shadow-xs shrink-0">
                <i className="pi pi-heart" />
              </div>
            </div>

            {/* Total Citas */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between hover:border-blue-300 transition-all">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Total Citas
                </span>
                <div className="text-2xl font-extrabold text-slate-900">
                  {loading ? "..." : metricas.total}
                </div>
                <span className="text-xs text-slate-500 font-medium block">En el sistema</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xl shadow-xs shrink-0">
                <i className="pi pi-calendar" />
              </div>
            </div>
          </div>

          {/* Sección Inferior: Pacientes en Fila y Accesos Directos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda (2/3): Pacientes Próximos */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 md:p-6 space-y-
  4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">Pacientes en Espera de Atención</h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">Próximos pacientes en fila para toma de signos</p>
                </div>
                <Button
                  label="Ver Estación Completa"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  text
                  size="small"
                  onClick={() => navigate("/triaje")}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                />
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <i className="pi pi-spin pi-spinner text-2xl text-cyan-600 mb-2" />
                  <span className="text-xs">Cargando pacientes...</span>
                </div>
              ) : proximosPacientes.length === 0 ? (
                <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                  <i className="pi pi-check-circle text-3xl text-slate-300" />
                  <p className="text-xs text-slate-500 m-0">No hay pacientes pendientes de triaje en este momento.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {proximosPacientes.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between
  gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-xs
  font-bold shadow-sm">
                          {getIniciales(cita.pacienteNombre)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{cita.pacienteNombre}</span>
                          <span className="text-[11px] text-slate-500">
                            Dr(a). {cita.doctorNombre || "Médico"} • {cita.horaInicio ? cita.horaInicio.slice(0, 5) : "—"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Tag
                          value={cita.estado === "PENDIENTE" ? "Falta Triaje" : "En Espera Dr."}
                          severity={cita.estado === "PENDIENTE" ? "warning" : "info"}
                          className="text-[10px]"
                        />
                        {cita.estado === "PENDIENTE" && (
                          <Button
                            label="Atender"
                            icon="pi pi-heart"
                            size="small"
                            onClick={() => navigate("/triaje")}
                            className="px-3 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white
  border-none"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha (1/3): Accesos Directos */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 md:p-6 space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 m-0">Acciones de Enfermería</h3>
                <p className="text-xs text-slate-500 m-0">Atajos para la jornada</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/triaje")}
                  className="w-full p-3.5 rounded-xl border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/50 flex items-center gap-3.5 transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 group-hover:bg-cyan-600 flex items-center justify-center transition-all shrink-0">
                    <i className="pi pi-heart-fill text-base text-cyan-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-cyan-900">
                      Estación de Triaje
                    </span>
                    <span className="text-[11px] text-slate-500">Toma de signos vitales</span>
                  </div>
                  <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate("/pacientes")}
                  className="w-full p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 flex items-center gap-3.5 transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center transition-all shrink-0">
                    <i className="pi pi-users text-base text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-900">
                      Directorio de Pacientes
                    </span>
                    <span className="text-[11px] text-slate-500">Consultar expedientes</span>
                  </div>
                  <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
    );
}