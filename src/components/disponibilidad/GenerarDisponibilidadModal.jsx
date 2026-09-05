import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { disponibilidadServie } from "../../services/disponibilidadService";
import { mostrarErrorApi, mostrarExitoApi, mostrarAdvertenciaApi } from "../../utils/alertasApi";

//Calcular lunes y viernes de la proxima semana
const obtenerSemanaSiguiente = () => {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diaHastaLunes = diaSemana === 0 ? 1 : 8 - diaSemana;

    const proximoLunes = new Date();
    proximoLunes.setDate(hoy.getDate() + diaHastaLunes);
    proximoLunes.setHours(0, 0, 0, 0);

    const proximosViernes = new Date(proximoLunes);
    proximosViernes.setDate(proximoLunes.getDate() + 4);

    return {proximoLunes, proximosViernes}
}
const formatearFechaISO = (fecha) => {
    if(!fecha) return "";
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

export default function GenerarDisponiibilidadModal({visible, onHide, doctorId, onGeneradoExito}){
    const {proximoLunes, proximosViernes} = obtenerSemanaSiguiente();

    const [fechaInicio, setFechaInicio] = useState(proximoLunes);
    const [fechaFin, setFechaFin] = useState(proximosViernes);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);

    //Validar formulario antes de enviar
    const validarFormulario = () => {
        if(!fechaInicio) return "La fecha de inicio es requerida.";
        if(!fechaFin) return "La fecha de fin es requerida.";
        if(fechaInicio > fechaFin) return "La fecha de inicio no puede ser posterior a la fecha de fin.";

        const diffDias = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));
        if(diffDias > 7) return "El rango máximo permitido es de 7 días (planificación semanal).";

        return null
    }

    const handleGenerar = async () => {
        setSubmitted(true);
        const error = validarFormulario();
        if(error){
            mostrarAdvertenciaApi(toast, error);
            return;
        }

        setLoading(true);
        try{
            const response = await disponibilidadServie.generar({
                doctorId,
                fechaInicio: formatearFechaISO(fechaInicio),
                fechaFin: formatearFechaISO(fechaFin)
            });
            
            // Cerramos el modal de inmediato y notificamos al componente padre
            hideDialog();
            if(onGeneradoExito) onGeneradoExito(response?.message || "Disponibilidades generadas correctamente.");
        }catch(err){
            mostrarErrorApi(toast, err, "Error al generar la disponibilidad.");
        }finally{
            setLoading(false);
        }
    }

    const hideDialog = () => {
        setSubmitted(false);
        onHide();
    }

    const dialogoFooter = (
        <div className="flex justify-end gap-3 pt-3">
          <Button 
            label="Cancelar" 
            icon="pi pi-times" 
            outlined 
            severity="secondary"
            onClick={hideDialog} 
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 border-slate-300 hover:bg-slate-100 transition-all" 
          />
          <Button 
            label={loading ? "Generando..." : "Generar Disponibilidad"} 
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-calendar-plus"} 
            onClick={handleGenerar}
            loading={loading}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all" 
          />
        </div>
    );

    return (
        <>
          <Toast ref={toast} />
          <Dialog
            visible={visible}
            style={{ width: "90vw", maxWidth: "520px" }}
            header={
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <i className="pi pi-calendar-plus text-sm" />
                </div>
                <span className="font-bold text-slate-900 text-lg">Generar Disponibilidad Semanal</span>
              </div>
            }
            modal
            className="p-fluid"
            onHide={hideDialog}
          >
            <div className="space-y-4 pt-1">
              {/* Banner informativo */}
              <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-start gap-3">
                <i className="pi pi-info-circle text-blue-600 text-base mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-blue-900 mb-0.5">Planificación Semanal</p>
                  <p>Se crearán bloques de 30 min de Lunes a Viernes según tu horario base, omitiendo la hora de almuerzo.</p>
                </div>
              </div>

              {/* Grid con los dos selectores de fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <label htmlFor="fechaInicio" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="pi pi-calendar text-blue-600 text-xs" />
                    Fecha Inicio*
                  </label>
                  <Calendar
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.value)}
                    dateFormat="yy-mm-dd"
                    minDate={new Date()}
                    showIcon
                    className={`w-full ${submitted && !fechaInicio ? "p-invalid" : ""}`}
                    inputClassName="bg-white text-sm font-medium text-slate-800 rounded-lg h-10 px-3 border-slate-300"
                  />
                  {submitted && !fechaInicio && (
                    <small className="p-error block mt-1.5 text-xs font-medium">La fecha de inicio es requerida.</small>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <label htmlFor="fechaFin" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <i className="pi pi-calendar text-indigo-600 text-xs" />
                    Fecha Fin*
                  </label>
                  <Calendar
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.value)}
                    dateFormat="yy-mm-dd"
                    minDate={fechaInicio || new Date()}
                    showIcon
                    className={`w-full ${submitted && !fechaFin ? "p-invalid" : ""}`}
                    inputClassName="bg-white text-sm font-medium text-slate-800 rounded-lg h-10 px-3 border-slate-300"
                  />
                  {submitted && !fechaFin && (
                    <small className="p-error block mt-1.5 text-xs font-medium">La fecha de fin es requerida.</small>
                  )}
                </div>
              </div>

              {/* Botones de acción dentro del modal con fondo sólido y borde divisor */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80">
                <Button 
                  label="Cancelar" 
                  icon="pi pi-times" 
                  onClick={hideDialog} 
                  disabled={loading}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all shadow-xs cursor-pointer" 
                />
                <Button 
                  label={loading ? "Generando..." : "Generar Disponibilidad"} 
                  icon={loading ? "pi pi-spin pi-spinner" : "pi pi-calendar-plus"} 
                  onClick={handleGenerar}
                  loading={loading}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all cursor-pointer" 
                />
              </div>
            </div>
          </Dialog>
        </>
    );
}