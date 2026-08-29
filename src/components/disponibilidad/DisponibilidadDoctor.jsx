 import { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Tag } from "primereact/tag";
import { Toolbar } from "primereact/toolbar";
import { useAuth } from "../../auth/AuthContext";
import { disponibilidadServie } from "../../services/disponibilidadService";
import { mostrarErrorApi, mostrarExitoApi } from "../../utils/alertasApi";
import GenerarDisponiibilidadModal from "./GenerarDisponibilidadModal";

//Formateamos la fecha a como lo require la API
const formatearFechaISO = (fecha) => {
    if(!fecha) return "";
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

export default function DisponibilidadDoctor(){
    //Extraer el doctor autenticado
    const {usuario} = useAuth();
    const doctorId = usuario?.doctorId;

    //Estado del componente: fecha a consultar, lista de slots, carga y apertura del modal
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalGenerar, setModalGenerar] = useState(false);

    const toast = useRef(null);
    //Recargar los turnos cada ves que cambia el doctor en la fecha selecionada
    useEffect(() => {
        if(doctorId){
            cargarSlots();
        }
    }, [doctorId, fechaSeleccionada]);

    //Peticion a la API para traer los turnos del doctor en la fecha selecionada
    const cargarSlots = async () => {
        setLoading(true);
        try{
            const data = await disponibilidadServie.obtenerDoctorPorFecha(
                doctorId,
                formatearFechaISO(fechaSeleccionada)
            );
            setSlots(data || []);
        }catch(err){
            mostrarErrorApi(toast, err, "Error al cargar los slots de disponibilidad.")
        }finally{
            setLoading(false);
        }
    }

    //Permir sumar o restar dias para avanzar o retroceder en el calendario
    const cambiarDia = (dias) => {
        const nuevaFecha = new Date(fechaSeleccionada);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        setFechaSeleccionada(nuevaFecha);
    }

    //Restablecer la fecha selecioonada al dia actual
    const irAHoy = () => {
        setFechaSeleccionada(new Date());
    }

    //Determinar el color del tag dsegun el estado
    const getBadSeverity = (estado) => {
        switch(estado){
            case "DISPONIBLE":
                return "success";
            case "OCUPADO":
                return "info";
            case "BLOQUEADO":
                return "danger"
            default:
                return null;
        }
    }

    //Contenido del lado izquierdo de la barra de herramientas (Acciones principales)
    const toolbarStart = (
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            label="Generar Semana"
            icon="pi pi-calendar-plus"
            onClick={() => setModalGenerar(true)}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border-none transition-all"
          />
          <Button
            label="Hoy"
            icon="pi pi-clock"
            outlined
            severity="secondary"
            onClick={irAHoy}
            className="px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-all"
          />
        </div>
    )

    //Contenido del lado derecho de la barra de herramientas (Navegador y filtro de fechas)
    const toolbarEnd = (
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200/80 shadow-sm">
          <Button
            icon="pi pi-chevron-left"
            rounded
            text
            severity="secondary"
            onClick={() => cambiarDia(-1)}
            tooltip="Día anterior"
            tooltipOptions={{ position: "top" }}
            className="w-9 h-9 text-slate-600 hover:bg-slate-100 transition-colors"
          />
          <Calendar
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.value || new Date())}
            dateFormat="dd/mm/yy"
            showIcon
            className="w-48 text-sm"
            inputClassName="h-9 text-sm font-semibold text-slate-800 border-none focus:ring-0 text-center bg-transparent"
          />
          <Button
            icon="pi pi-chevron-right"
            rounded
            text
            severity="secondary"
            onClick={() => cambiarDia(1)}
            tooltip="Día siguiente"
            tooltipOptions={{ position: "top" }}
            className="w-9 h-9 text-slate-600 hover:bg-slate-100 transition-colors"
          />
        </div>
    )

    return (
        <div className="p-2 md:p-4">
          {/* Componente Toast para alertas */}
          <Toast ref={toast} />

          {/* Tarjeta principal con fondo blanco y sombra suave */}
          <div className="card shadow-md rounded-xl bg-white p-4">

            {/* Título de la sección */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-800 m-0">
                Agenda y Disponibilidad
              </h3>
              <p className="text-sm text-surface-muted m-0 mt-1">
                Visualiza y administra tus turnos diarios de atención médica.
              </p>
            </div>

            {/* Toolbar con botones de acción y selector de día */}
            <Toolbar
              className="mb-4 bg-slate-50 border border-surface-border rounded-lg"
              start={toolbarStart}
              end={toolbarEnd}
            />

            {/* Banner de fecha actual con conteo de turnos */}
            <div className="mb-4 flex items-center justify-between bg-primary-50 border border-primary-100 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar text-primary text-base" />
                <span className="font-semibold text-sm text-primary-900 capitalize">
                  {fechaSeleccionada.toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <span className="text-xs font-medium text-primary-800 bg-white px-2.5 py-1 rounded-full border border-primary-200">
                {slots.length} turnos programados
              </span>
            </div>

            {/* Renderizado condicional: Spinner de carga, estado vacío o cuadrícula de turnos */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-surface-muted">
                <i className="pi pi-spin pi-spinner text-3xl mb-2 text-primary" />
                <p className="text-sm">Cargando turnos...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-surface-border rounded-xl">
                <i className="pi pi-calendar-times text-4xl text-slate-300 mb-3" />
                <h4 className="text-base font-semibold text-slate-700 m-0 mb-1">
                  No hay turnos generados para este día
                </h4>
                <p className="text-xs text-surface-muted max-w-sm mb-4">
                  Puedes generar automáticamente los slots semanales basados en tu horario de atención.
                </p>
                <Button
                  label="Generar Disponibilidad"
                  icon="pi pi-calendar-plus"
                  size="small"
                  onClick={() => setModalGenerar(true)}
                />
              </div>
            ) : (
              /* Grid responsivo de bloques de 30 minutos */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3.5 border border-surface-border rounded-xl hover:shadow-soft transition-all duration-200 bg-white flex flex-col justify-between"
                  >
                    {/* Rango de horas y Tag de estado */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                        <i className="pi pi-clock text-xs text-slate-400" />
                        {slot.horaInicio.slice(0, 5)} - {slot.horaFin.slice(0, 5)}
                      </span>
                      <Tag
                        value={slot.estado}
                        severity={getBadSeverity(slot.estado)}
                        className="text-xs"
                      />
                    </div>

                    {/* Pie de tarjeta con identificador de cita y duración fija */}
                    <div className="text-xs text-surface-muted mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>{slot.citaId ? `Cita #${slot.citaId}` : "Sin cita asignada"}</span>
                      <span className="text-[10px] text-slate-400">30 min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal para generar disponibilidad semanal */}
          <GenerarDisponiibilidadModal
            visible={modalGenerar}
            onHide={() => setModalGenerar(false)}
            doctorId={doctorId}
            onGeneradoExito={(mensaje) => {
              mostrarExitoApi(toast, mensaje);
              cargarSlots();
            }}
          />
        </div>
    );
}