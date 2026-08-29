import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useAuth } from "../../auth/AuthContext";
import { disponibilidadServie } from "../../services/disponibilidadService";

//Convertir fecha a YYYY-MM-DD
const formatearFechaISO = (fecha) => {
    if(!fecha) return "";
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

export default function DashboardDoctor(){
    const { usuario } = useAuth();
    const doctorId = usuario?.doctorId;
    const navigate = useNavigate();

    //Estados del dashboard
    const [slotsHoy, setSlotsHoy] = useState([]);
    const [loading, setLoading] = useState(true);

    //Fecha actual formateada
    const hoy = new Date();
    const fechaHoyStr = formatearFechaISO(hoy);

    useEffect(() => {
        if(doctorId){
            cargarResumenHoy();
        }
    }, [doctorId])

    //Cargar los turnos del doctor para el dia de hoy
    const cargarResumenHoy = async () => {
        setLoading(true);
        try{
            const data = await disponibilidadServie.obtenerDoctorPorFecha(doctorId, fechaHoyStr);
            setSlotsHoy(data || []);
        }catch{
            setSlotsHoy([]);
        }finally{
            setLoading(false);
        }
    }

    //Metricas calculadas del dia
    const totalSlots = slotsHoy.length;
    const slotsOcupados = slotsHoy.filter((s) => s.estado === "OCUPADO").length;
    const slotsDisponibles = slotsHoy.filter((s) => s.estado === "DISPONIBLE").length;
    const proximoTurno = slotsHoy.find((s) => s.estado === "OCUPADO" || s.estado === "DISPONIBLE");

    return (
        <div className="space-y-6">
          {/* Banner de Bienvenida */}
          <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sidebar to-slate-900 text-white shadow-soft-xl
  relative overflow-hidden">
            {/* Luces decorativas */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
  />
            <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-
  teal-300 text-xs font-semibold">
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
                  Bienvenido de nuevo,{" "}
                  <span className="text-teal-300">Dr. {usuario?.nombre || "Médico"}</span>
                </h1>

                <p className="text-slate-400 text-sm max-w-xl">
                  Aquí tienes el resumen de tu jornada médica y el estado de tus citas programadas para hoy.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  label="Ver Mi Agenda"
                  icon="pi pi-calendar"
                  onClick={() => navigate("/disponibilidad")}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-
  blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Grid de Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tarjeta 1: Total Turnos de Hoy */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Turnos Hoy
                </span>
                <div className="text-2xl font-bold text-slate-900">{loading ? "..." : totalSlots}</div>
                <span className="text-[11px] text-slate-400">Bloques de 30 min</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
                <i className="pi pi-clock" />
              </div>
            </div>

            {/* Tarjeta 2: Citas Agendadas */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Citas Agendadas
                </span>
                <div className="text-2xl font-bold text-teal-600">
                  {loading ? "..." : slotsOcupados}
                </div>
                <span className="text-[11px] text-teal-600 font-medium">Pacientes citados</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl shadow-sm">
                <i className="pi pi-users" />
              </div>
            </div>

            {/* Tarjeta 3: Slots Disponibles */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Disponibles
                </span>
                <div className="text-2xl font-bold text-emerald-600">
                  {loading ? "..." : slotsDisponibles}
                </div>
                <span className="text-[11px] text-slate-400">Cupos libres hoy</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-
  sm">
                <i className="pi pi-check-circle" />
              </div>
            </div>

            {/* Tarjeta 4: Próximo Turno */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-soft flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Primer Turno
                </span>
                <div className="text-lg font-bold text-slate-900 truncate max-w-[120px]">
                  {loading ? "..." : proximoTurno ? proximoTurno.horaInicio.slice(0, 5) : "Sin turnos"}
                </div>
                <span className="text-[11px] text-slate-400">Inicio de jornada</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-
  sm">
                <i className="pi pi-hourglass" />
              </div>
            </div>
          </div>

          {/* Sección Inferior: Lista Rápida de Turnos de Hoy y Accesos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Izquierda (2/3): Turnos de hoy */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 m-0">Turnos de Hoy</h3>
                  <p className="text-xs text-slate-500 m-0">Estado de tus bloques para la fecha actual</p>
                </div>
                <Button
                  label="Ver todos"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  text
                  size="small"
                  onClick={() => navigate("/disponibilidad")}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                />
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <i className="pi pi-spin pi-spinner text-2xl text-blue-600 mb-2" />
                  <span className="text-xs">Cargando turnos...</span>
                </div>
              ) : slotsHoy.length === 0 ? (
                <div className="py-12 px-4 text-center border border-dashed border-slate-200 rounded-xl space-y-3">
                  <i className="pi pi-calendar-times text-3xl text-slate-300" />
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    No tienes turnos generados para hoy. Puedes generarlos desde el módulo de disponibilidad.
                  </p>
                  <Button
                    label="Ir a Disponibilidad"
                    icon="pi pi-calendar-plus"
                    size="small"
                    onClick={() => navigate("/disponibilidad")}
                    className="text-xs"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {slotsHoy.slice(0, 6).map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center text-xs font-
  bold shadow-sm border border-slate-200/60">
                          <i className="pi pi-clock text-xs text-slate-500" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {slot.horaInicio.slice(0, 5)} - {slot.horaFin.slice(0, 5)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {slot.citaId ? `Cita #${slot.citaId}` : "Libre"}
                          </span>
                        </div>
                      </div>
                      <Tag
                        value={slot.estado}
                        severity={
                          slot.estado === "DISPONIBLE"
                            ? "success"
                            : slot.estado === "OCUPADO"
                            ? "info"
                            : "danger"
                        }
                        className="text-[10px]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha (1/3): Accesos Directos */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 md:p-6 space-y-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 m-0">Acciones Rápidas</h3>
                <p className="text-xs text-slate-500 m-0">Atajos para la gestión de tu consulta</p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => navigate("/disponibilidad")}
                  className="w-full p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 flex
  items-center gap-3.5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex
  items-center justify-center transition-colors">
                    <i className="pi pi-calendar-plus text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-blue-900">
                      Planificar Semana
                    </span>
                    <span className="text-[11px] text-slate-500">Generar disponibilidad</span>
                  </div>
                  <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/pacientes")}
                  className="w-full p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-300 hover:bg-teal-50/50 flex
  items-center gap-3.5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-600 group-hover:text-white flex
  items-center justify-center transition-colors">
                    <i className="pi pi-users text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-800 block group-hover:text-teal-900">
                      Directorio de Pacientes
                    </span>
                    <span className="text-[11px] text-slate-500">Ver expedientes clínicos</span>
                  </div>
                  <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
    );
}