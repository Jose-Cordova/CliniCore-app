import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Carousel } from "primereact/carousel";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../auth/AuthContext";
import { obtenerCitasPorPaciente, cancelarCitaPaciente } from "../../services/citaService";
import { obtenerConsultasPorPaciente } from "../../services/consultaService";
import { mostrarExitoApi, mostrarErrorApi } from "../../utils/alertasApi";

const DashboardPaciente = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef(null);

  const [cargando, setCargando] = useState(true);
  const [citas, setCitas] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [citasPendientesLista, setCitasPendientesLista] = useState([]);
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);

  const [metricas, setMetricas] = useState({
    pendientes: 0,
    atendidas: 0,
    consultas: 0,
    canceladas: 0,
  });

  useEffect(() => {
    cargarDatosDashboard();
  }, [usuario]);

  const cargarDatosDashboard = async () => {
    if (!usuario?.pacienteId) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);

      // Cargar citas y consultas en paralelo
      const [dataCitas, dataConsultas] = await Promise.all([
        obtenerCitasPorPaciente(usuario.pacienteId).catch(() => []),
        obtenerConsultasPorPaciente(usuario.pacienteId).catch(() => []),
      ]);

      const listaCitas = Array.isArray(dataCitas) ? dataCitas : [];
      const listaConsultas = Array.isArray(dataConsultas) ? dataConsultas : [];

      setCitas(listaCitas);
      setConsultas(listaConsultas);

      // Calcular Métricas
      const pendientesCount = listaCitas.filter(
        (c) => c.estado === "PENDIENTE" || c.estado === "EN_ESPERA"
      ).length;
      const atendidasCount = listaCitas.filter((c) => c.estado === "ATENDIDA").length;
      const canceladasCount = listaCitas.filter((c) => c.estado === "CANCELADA").length;

      setMetricas({
        pendientes: pendientesCount,
        atendidas: atendidasCount,
        consultas: listaConsultas.length,
        canceladas: canceladasCount,
      });

      // Obtener todas las citas pendientes ordenadas cronológicamente
      const pendientes = listaCitas
        .filter((c) => c.estado === "PENDIENTE" || c.estado === "EN_ESPERA")
        .sort((a, b) => new Date(`${a.fecha}T${a.horaInicio}`) - new Date(`${b.fecha}T${b.horaInicio}`));

      setCitasPendientesLista(pendientes);
      setIndiceCarrusel(0);
    } catch (error) {
      console.error("Error al cargar el dashboard del paciente:", error);
      mostrarErrorApi(toastRef, error, "No se pudieron cargar los datos de inicio.");
    } finally {
      setCargando(false);
    }
  };

  const confirmarCancelarCita = async (citaId) => {
    const resultado = await Swal.fire({
      title: "¿Cancelar cita médica?",
      text: "Esta acción liberará el cupo con el médico. ¿Deseas continuar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar cita",
      cancelButtonText: "No, mantener cita",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      customClass: {
        popup: "rounded-2xl shadow-xl font-sans",
        confirmButton: "rounded-xl font-semibold px-4 py-2 text-sm",
        cancelButton: "rounded-xl font-semibold px-4 py-2 text-sm",
      },
    });

    if (resultado.isConfirmed) {
      try {
        await cancelarCitaPaciente(citaId);
        mostrarExitoApi(toastRef, "La cita fue cancelada correctamente.");
        cargarDatosDashboard();
      } catch (error) {
        mostrarErrorApi(toastRef, error, "No se pudo cancelar la cita.");
      }
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ProgressSpinner />
        <p className="mt-4 text-slate-600 font-medium">Cargando su panel principal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <Toast ref={toastRef} />

      {/* Saludo y Encabezado de Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider block mb-1">
            Portal del Paciente
          </span>
          <h1 className="text-2xl md:text-3xl font-bold font-display">
            ¡Hola, {usuario?.nombre || "Bienvenido(a)"}! 
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            Gestiona tus citas médicas, revisa tus consultas anteriores y mantén tu expediente al día.
          </p>
        </div>
      </div>

      {/* Tarjetas Métricas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Citas Pendientes */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Citas Pendientes
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {metricas.pendientes}
            </span>
            <span className="text-xs text-blue-600 font-medium mt-0.5 block">Próximas atenciones</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i className="pi pi-calendar-plus" />
          </div>
        </div>

        {/* Card 2: Citas Atendidas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Citas Completadas
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {metricas.atendidas}
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-0.5 block">Atendidas con éxito</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
            <i className="pi pi-check-circle" />
          </div>
        </div>

        {/* Card 3: Consultas Registradas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Consultas Registradas
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {metricas.consultas}
            </span>
            <span className="text-xs text-indigo-600 font-medium mt-0.5 block">Recetas y Tirajes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
            <i className="pi pi-folder-open" />
          </div>
        </div>

        {/* Card 4: Citas Canceladas */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Citas Canceladas
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {metricas.canceladas}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-0.5 block">Historial de cancelaciones</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl">
            <i className="pi pi-times-circle" />
          </div>
        </div>
      </div>

      {/* Sección Próxima Cita & Accesos Directos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas (Carrusel Animado PrimeReact) */}
        <div className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>Próximas Citas Médicas</span>
                {citasPendientesLista.length > 0 && (
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    {citasPendientesLista.length} cita agendadas
                  </span>
                )}
              </div>
            }
            className="shadow-sm border border-slate-200 h-full"
          >
            {citasPendientesLista.length > 0 ? (
              <Carousel
                value={citasPendientesLista}
                numVisible={1}
                numScroll={1}
                circular={citasPendientesLista.length > 1}
                showIndicators={citasPendientesLista.length > 1}
                showNavigators={citasPendientesLista.length > 1}
                itemTemplate={(citaActual) => (
                  <div className="p-1">
                    <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <i className="pi pi-user-md text-blue-600 text-base" />
                            {citaActual.doctorNombre || "Doctor Asignado"}
                          </h3>
                          <span className="text-xs text-blue-700 font-semibold mt-0.5 block">
                            Especialidad: {citaActual.especialidadNombre || "Medicina General"}
                          </span>
                        </div>
                        <Tag value="Cita Confirmada" severity="info" className="self-start sm:self-center px-3 py-1 text-xs" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                          <i className="pi pi-calendar text-blue-600 text-base" />
                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Fecha</span>
                            <span className="font-bold text-slate-800">{citaActual.fecha}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                          <i className="pi pi-clock text-blue-600 text-base" />
                          <div>
                            <span className="text-[11px] text-slate-400 font-semibold block uppercase">Hora</span>
                            <span className="font-bold text-slate-800">{citaActual.horaInicio}</span>
                          </div>
                        </div>
                      </div>

                      {citaActual.motivo && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100 text-xs shadow-sm">
                          <span className="font-semibold text-slate-500 block mb-0.5 uppercase">Motivo de consulta:</span>
                          <p className="text-slate-700">{citaActual.motivo}</p>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2 border-t border-blue-100">
                        <Button
                          label="Cancelar esta Cita"
                          icon="pi pi-times"
                          className="p-button-danger p-button-text text-xs h-9"
                          onClick={() => confirmarCancelarCita(citaActual.id)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="text-center py-8">
                <i className="pi pi-calendar-times text-4xl text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700 text-base">No tienes citas agendadas próximas</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  Si necesitas atención médica, agenda una cita seleccionando el doctor y horario de tu preferencia.
                </p>
                <Button
                  label="Agendar Cita Ahora"
                  icon="pi pi-plus"
                  className="p-button-primary text-xs h-9 px-4 rounded-xl"
                  onClick={() => navigate("/citas")}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Tarjeta de Accesos Directos (Toma 1 columna) */}
        <div>
          <Card title="Accesos Rápida" className="shadow-sm border border-slate-200 h-full">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/citas")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
                    <i className="pi pi-calendar-plus" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block group-hover:text-blue-700">
                      Citas Médicas
                    </span>
                    <span className="text-xs text-slate-500">Agendar citas</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/mis-consultas")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-base">
                    <i className="pi pi-folder-open" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block group-hover:text-indigo-700">
                      Mis Consultas
                    </span>
                    <span className="text-xs text-slate-500">Revisar recetas y diagnósticos</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/mi-expediente")}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-teal-50/50 transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center text-base">
                    <i className="pi pi-id-card" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 block group-hover:text-teal-700">
                      Mi Expediente
                    </span>
                    <span className="text-xs text-slate-500">Datos personales y contacto</span>
                  </div>
                </div>
                <i className="pi pi-chevron-right text-xs text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPaciente;
