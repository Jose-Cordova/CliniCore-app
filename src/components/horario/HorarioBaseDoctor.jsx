import { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAuth } from "../../auth/AuthContext";
import { horarioBaseService } from "../../services/horarioBaseService";
import { mostrarExitoApi, mostrarErrorApi, mostrarAdvertenciaApi } from "../../utils/alertasApi";

const DIAS = [
    { key: "LUNES", label: "Lunes" },
    { key: "MARTES", label: "Martes" },
    { key: "MIERCOLES", label: "Miércoles" },
    { key: "JUEVES", label: "Jueves" },
    { key: "VIERNES", label: "Viernes" },
];

 const HORARIO_DEFAULT = {
    activo: true,
    horaInicio: "08:00",
    horaFin: "15:00",
    horaAlmuerzoInicio: "12:00",
    horaAlmuerzoFin: "13:00",
};

export default function HorariBaseDoctor(){
    const {usuario} = useAuth();
    const doctorId = usuario?.doctorId;
    const toast = useRef(null);

    const [horarios, setHorarios] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if(doctorId) cargarHorarios();
    }, [doctorId]);

    const cargarHorarios = async () => {
        setLoading(true);
        try{
            const data = await horarioBaseService.obtenerPorDoctor(doctorId);
            const mapa = {};
            DIAS.forEach((dia) => {
                const encontrado = data.find((h) => h.diaSemana === dia.key);
                if(encontrado){
                    mapa[dia.key] = {
                        activo: true,
                        horaInicio: encontrado.horaInicio?.slice(0, 5) || "08:00",
                        horaFin: encontrado.horaFin?.slice(0, 5) || "15:00",
                        horaAlmuerzoInicio: encontrado.horaAlmuerzoInicio?.slice(0, 5) || "12:00",
                        horaAlmuerzoFin: encontrado.horaAlmuerzoFin?.slice(0, 5) || "13:00"
                    }
                }else{
                    mapa[dia.key] = { ...HORARIO_DEFAULT, activo: false }
                }
            });
            setHorarios(mapa);
        }catch(err){
            mostrarErrorApi(toast, err, "Error al cargar los horarios.");
        }finally{
            setLoading(false);
        }
    }

    const handleChange = (dia, campo, valor) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: { ...prev[dia], [campo]: valor }
        }));
    }
    const toggleDia = (dia) => {
        setHorarios((prev) => ({
            ...prev,
            [dia]: { ...prev[dia], activo: !prev[dia].activo }
        }))
    }

    const handleGuardar = async () => {
        const diasActivos = DIAS.filter((d) => horarios[d.key]?.activo);
        if(diasActivos.length === 0){
            mostrarAdvertenciaApi(toast, "Debes activar al menos un día laboral.");
            return;
        }

        const payload = diasActivos.map((d) => {
            const h = horarios[d.key];
            return {
                diaSemana: d.key,
                horaInicio: h.horaInicio + ":00",
                horaFin: h.horaFin + ":00",
                horaAlmuerzoInicio: h.horaAlmuerzoInicio + ":00",
                horaAlmuerzoFin: h.horaAlmuerzoFin + ":00",
                doctorId
            }
        });
        setSaving(true);
        try{
            const response = await horarioBaseService.guardar(doctorId, payload);
            mostrarExitoApi(toast, response?.message || "Horarios guardados correctamente.");
        }catch(err){
            mostrarErrorApi(toast, err, "Error al guardar los horarios.");
        }finally{
            setSaving(false);
        }
    }
    if(loading){
        return (
            <div className="flex items-center justify-center py-20">
                <i className="pi pi-spin pi-spinner text-3xl text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
          <Toast ref={toast} />

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-extrabold text-slate-900 m-0">
                Mi Horario Base
              </h2>
              <p className="text-sm text-slate-500 mt-0.5 m-0">
                Configura tu jornada laboral de Lunes a Viernes. Los turnos de disponibilidad se generarán en base a estos horarios.
              </p>
            </div>
            <Button
              label="Guardar Cambios"
              icon="pi pi-save"
              loading={saving}
              onClick={handleGuardar}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-
  700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all shrink-0"
            />
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {DIAS.map((dia) => {
              const h = horarios[dia.key] || HORARIO_DEFAULT;
              const activo = h.activo;

              return (
                <div
                  key={dia.key}
                  className={`p-5 rounded-2xl border transition-all ${
                    activo
                      ? "bg-white border-slate-200/80 shadow-soft"
                      : "bg-slate-50 border-dashed border-slate-300 opacity-60"
                  }`}
                >
                  {/* Cabecera del día con toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shadow-sm ${
                          activo
                            ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {dia.label.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">
                          {dia.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {activo ? "Día laboral activo" : "Día libre"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleDia(dia.key)}
                      className={`w-12 h-7 rounded-full flex items-center px-1 transition-all cursor-pointer border-none ${
                        activo ? "bg-blue-600 justify-end" : "bg-slate-300 justify-start"
                      }`}
                      title={activo ? "Desactivar día" : "Activar día"}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-all" />
                    </button>
                  </div>

                  {/* Campos de horario (solo si está activo) */}
                  {activo && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Entrada
                          </label>
                          <input
                            type="time"
                            value={h.horaInicio}
                            onChange={(e) =>
                              handleChange(dia.key, "horaInicio", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-
  medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                            Salida
                          </label>
                          <input
                            type="time"
                            value={h.horaFin}
                            onChange={(e) =>
                              handleChange(dia.key, "horaFin", e.target.value)
                            }
                            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-
  medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                          <i className="pi pi-clock text-[10px] mr-1" />
                          Almuerzo
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">
                              Desde
                            </label>
                            <input
                              type="time"
                              value={h.horaAlmuerzoInicio}
                              onChange={(e) =>
                                handleChange(dia.key, "horaAlmuerzoInicio", e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800
  font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-0.5">
                              Hasta
                            </label>
                            <input
                              type="time"
                              value={h.horaAlmuerzoFin}
                              onChange={(e) =>
                                handleChange(dia.key, "horaAlmuerzoFin", e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800
  font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
    );
}