import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { useAuth } from "../../auth/AuthContext";
import { obtenerConsultasPorPaciente } from "../../services/consultaService";
import { mostrarErrorApi } from "../../utils/alertasApi";

const MisConsultasPaciente = () => {
  const { usuario } = useAuth();
  const toastRef = useRef(null);

  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarConsultas();
  }, [usuario]);

  const cargarConsultas = async () => {
    if (!usuario?.pacienteId) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const data = await obtenerConsultasPorPaciente(usuario.pacienteId);
      // Ordenar por fecha de atención descendente (la más reciente primero)
      const ordenadas = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.fechaAtencion) - new Date(a.fechaAtencion))
        : [];
      setConsultas(ordenadas);
    } catch (error) {
      console.error("Error al cargar consultas del paciente:", error);
      mostrarErrorApi(toastRef, error, "No se pudo obtener su historial de consultas.");
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = (consulta) => {
    setConsultaSeleccionada(consulta);
    setModalVisible(true);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-SV", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ProgressSpinner />
        <p className="mt-4 text-slate-600 font-medium">Cargando su historial de consultas...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <Toast ref={toastRef} />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="pi pi-book text-blue-600 text-2xl" />
            Mis Consultas Médicas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa tu historial de atenciones, tirajes de signos vitales, diagnósticos y tratamientos recetados.
          </p>
        </div>
        <Tag value={`${consultas.length} Consulta(s)`} severity="info" className="text-sm px-3 py-1.5 rounded-lg" />
      </div>

      {/* Lista de Consultas */}
      {consultas.length === 0 ? (
        <Card className="shadow-sm border border-slate-200 text-center py-10">
          <i className="pi pi-inbox text-5xl text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Sin historial de consultas</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Actualmente no tienes registros de consultas médicas finalizadas en tu expediente.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {consultas.map((item) => (
            <Card
              key={item.id}
              className="shadow-sm hover:shadow-md transition-shadow border border-slate-200 rounded-xl overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Fecha de atención</span>
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                      <i className="pi pi-calendar text-blue-500 text-xs" />
                      {formatearFecha(item.fechaAtencion)}
                    </span>
                  </div>
                  <Tag value="Completada" severity="success" className="text-[11px]" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Doctor Atendente</span>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <i className="pi pi-user-md text-blue-600 text-sm" />
                    {item.doctorNombre || "Doctor Asignado"}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Diagnóstico Principal</span>
                  <p className="text-sm text-slate-700 font-medium line-clamp-2 mt-0.5">
                    {item.diagnostico || "Sin diagnóstico especificado"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <Button
                    label="Ver Resumen y Receta"
                    icon="pi pi-eye"
                    className="p-button-outlined p-button-primary text-xs h-9"
                    onClick={() => abrirDetalle(item)}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalle de Consulta */}
      <Dialog
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="pi pi-file-check text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Detalle de Consulta Médica</h2>
              <p className="text-xs text-slate-500">
                Atendido el {formatearFecha(consultaSeleccionada?.fechaAtencion)}
              </p>
            </div>
          </div>
        }
        className="w-full max-w-3xl mx-4"
        modal
      >
        {consultaSeleccionada && (
          <div className="space-y-6 pt-2">
            {/* Médico Atendente */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  <i className="pi pi-user-md text-lg" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-semibold">Doctor Responsable</span>
                  <p className="text-base font-bold text-slate-800">
                    {consultaSeleccionada.doctorNombre || "Médico Especialista"}
                  </p>
                </div>
              </div>
              <Tag value="Expediente Atendido" severity="success" />
            </div>

            {/* Signos Vitales y Tiraje */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i className="pi pi-heart text-red-500 text-xs" />
                <span>Tiraje y Signos Vitales (Enfermería)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold block">Presión Arterial</span>
                  <span className="text-sm font-bold text-slate-800">
                    {consultaSeleccionada.tirajePa || "N/A"}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold block">Temperatura</span>
                  <span className="text-sm font-bold text-slate-800">
                    {consultaSeleccionada.tirajeTemperatura ? `${consultaSeleccionada.tirajeTemperatura} °C` : "N/A"}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold block">Peso</span>
                  <span className="text-sm font-bold text-slate-800">
                    {consultaSeleccionada.tirajePeso ? `${consultaSeleccionada.tirajePeso} kg` : "N/A"}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-[11px] text-slate-400 font-semibold block">Estatura</span>
                  <span className="text-sm font-bold text-slate-800">
                    {consultaSeleccionada.tirajeEstatura ? `${consultaSeleccionada.tirajeEstatura} cm` : "N/A"}
                  </span>
                </div>
              </div>
              {consultaSeleccionada.tirajeSintomas && (
                <div className="mt-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Síntomas reportados en tiraje:</span>
                  <p className="text-slate-600">{consultaSeleccionada.tirajeSintomas}</p>
                </div>
              )}
            </div>

            {/* Diagnóstico */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="pi pi-paperclip text-blue-600 text-xs" />
                <span>Diagnóstico Médico</span>
              </h3>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-sm font-medium text-slate-800">
                {consultaSeleccionada.diagnostico || "Sin diagnóstico ingresado"}
              </div>
            </div>

            {/* Tratamiento y Receta */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="pi pi-list-check text-emerald-600 text-xs" />
                <span>Tratamiento y Medicación Recetada</span>
              </h3>
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-sm text-slate-800 whitespace-pre-line">
                {consultaSeleccionada.tratamiento || "Sin indicaciones o tratamiento específico recetado."}
              </div>
            </div>

            {/* Notas Adicionales */}
            {consultaSeleccionada.nota && (
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <i className="pi pi-info-circle text-slate-500 text-xs" />
                  <span>Observaciones Médicas</span>
                </h3>
                <p className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  {consultaSeleccionada.nota}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button
                label="Cerrar"
                icon="pi pi-times"
                className="p-button-secondary text-xs h-10 px-5"
                onClick={() => setModalVisible(false)}
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default MisConsultasPaciente;
