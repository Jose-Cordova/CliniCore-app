import { useState, useEffect, useRef } from "react";
import {
  Dropdown,Calendar,Button,Dialog,InputTextarea,Toast,} from "../../config/primeReact";
import { listarEspecialidades } from "../../services/especialidadesService";
import { doctorService } from "../../services/doctorService";
import { disponibilidadServie } from "../../services/disponibilidadService";
import { citaService } from "../../services/citaService";

const CitasPaciente = () => {
  const toast = useRef(null);

  const [especialidades, setEspecialidades] = useState([]);
  const [doctoresTodos, setDoctoresTodos] = useState([]);
  const [doctoresFiltrados, setDoctoresFiltrados] = useState([]);

  const [especialidadId, setEspecialidadId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [fecha, setFecha] = useState(null);

  const [slots, setSlots] = useState([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Cargar especialidades y doctores al montar
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const [especialidadesData, doctoresData] = await Promise.all([
          listarEspecialidades(),
          doctorService.listarTodos(),
        ]);
        setEspecialidades(especialidadesData);
        setDoctoresTodos(doctoresData);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudieron cargar las especialidades y doctores.",
        });
      }
    };
    cargarDatosIniciales();
  }, []);

  // Filtrar doctores cuando cambia la especialidad
  useEffect(() => {
    if (!especialidadId) {
      setDoctoresFiltrados([]);
      setDoctorId(null);
      return;
    }
    const filtrados = doctoresTodos.filter(
      (doc) => doc.especialidadId === especialidadId
    );
    setDoctoresFiltrados(filtrados);
    setDoctorId(null);
    setSlots([]);
  }, [especialidadId, doctoresTodos]);

  // Consultar disponibilidad cuando ya hay doctor + fecha
  useEffect(() => {
    const consultarDisponibilidad = async () => {
      if (!doctorId || !fecha) {
        setSlots([]);
        return;
      }
      setCargandoSlots(true);
      try {
        const fechaISO = formatearFechaISO(fecha);
        const data = await disponibilidadServie.obtenerDoctorPorFecha(doctorId, fechaISO);
        setSlots(data);
      } catch (error) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "No se pudo obtener la disponibilidad del doctor.",
        });
        setSlots([]);
      } finally {
        setCargandoSlots(false);
      }
    };
    consultarDisponibilidad();
  }, [doctorId, fecha]);

  const formatearFechaISO = (fechaObj) => {
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  };

  const formatearHora = (horaStr) => horaStr?.slice(0, 5); 

  const formatearFechaLegible = (fechaStr) => {
    const [anio, mes, dia] = fechaStr.split("-");
    const fechaObj = new Date(anio, mes - 1, dia);
    return fechaObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const abrirModalAgendar = (slot) => {
    setSlotSeleccionado(slot);
    setMotivo("");
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setSlotSeleccionado(null);
    setMotivo("");
  };

  const confirmarAgendar = async () => {
    if (!motivo.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Motivo requerido",
        detail: "Por favor describe el motivo de tu cita.",
      });
      return;
    }

    setGuardando(true);
    try {
      await citaService.agendarCita({
        disponibilidadId: slotSeleccionado.id,
        motivo: motivo.trim(),
      });

      toast.current?.show({
        severity: "success",
        summary: "Cita agendada",
        detail: "Tu cita se agendó correctamente.",
      });

      cerrarModal();

      // Refrescar los slots para que el ocupado desaparezca de la lista
      const fechaISO = formatearFechaISO(fecha);
      const data = await disponibilidadServie.obtenerDoctorPorFecha(doctorId, fechaISO);
      setSlots(data);
    } catch (error) {
      const mensaje =
        error.response?.data?.message || "No se pudo agendar la cita. Intenta nuevamente.";
      toast.current?.show({
        severity: "error",
        summary: "Error al agendar",
        detail: mensaje,
      });
    } finally {
      setGuardando(false);
    }
  };

  const especialidadOptions = especialidades.map((e) => ({
    label: e.nombre,
    value: e.id,
  }));

  const doctorOptions = doctoresFiltrados.map((d) => ({
    label: `Dr(a). ${d.nombre} ${d.apellido}`,
    value: d.id,
  }));

  const especialidadSeleccionadaNombre =
    especialidades.find((e) => e.id === especialidadId)?.nombre || "";

  return (
    <div className="p-6">
      <Toast ref={toast} />

      <div className="bg-surface-card rounded-xl shadow-soft border border-surface-border p-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">
          Disponibilidad de citas
        </h1>
        <p className="text-surface-muted text-sm mt-1 mb-6">
          Elige el día, el doctor y su especialidad para agendar tu cita.
        </p>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Especialidad</label>
            <Dropdown
              value={especialidadId}
              options={especialidadOptions}
              onChange={(e) => setEspecialidadId(e.value)}
              placeholder="Selecciona una especialidad"
              filter
              scrollHeight="200px"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Doctor</label>
            <Dropdown
              value={doctorId}
              options={doctorOptions}
              onChange={(e) => setDoctorId(e.value)}
              placeholder="Selecciona un doctor"
              filter
              scrollHeight="200px"
              disabled={!especialidadId}
              emptyMessage="No hay doctores para esta especialidad"
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Fecha</label>
            <Calendar
              value={fecha}
              onChange={(e) => setFecha(e.value)}
              dateFormat="dd/mm/yy"
              minDate={new Date()}
              showIcon
              placeholder="Selecciona una fecha"
              className="w-full"
              disabled={!doctorId}
            />
          </div>
        </div>

        {/* Resultado de horarios */}
        {cargandoSlots && (
          <p className="text-surface-muted text-sm">Buscando horarios disponibles...</p>
        )}

        {!cargandoSlots && doctorId && fecha && slots.length === 0 && (
          <p className="text-surface-muted text-sm">
            No hay horarios disponibles para {especialidadSeleccionadaNombre} en la fecha seleccionada.
          </p>
        )}

        {!cargandoSlots && slots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-soft hover:shadow-soft-xl transition-shadow flex flex-col gap-2"
              >
                <span className="text-primary text-xs font-semibold">
                  {formatearFechaLegible(slot.fecha)}
                </span>
                <span className="text-slate-800 font-bold text-base">
                  {formatearHora(slot.horaInicio)} - {formatearHora(slot.horaFin)}
                </span>
                <span className="text-slate-600 text-sm">Dr(a). {slot.doctorNombre}</span>
                <span className="text-surface-muted text-xs">
                  {especialidadSeleccionadaNombre}
                </span>
                <Button
                  label="Agendar"
                  className="mt-2 bg-primary hover:bg-primary-hover border-none text-white text-sm py-2 rounded-lg"
                  onClick={() => abrirModalAgendar(slot)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para ingresar el motivo */}
      <Dialog
        header="Agendar cita"
        visible={modalVisible}
        onHide={cerrarModal}
        style={{ width: "28rem" }}
        modal
      >
        {slotSeleccionado && (
          <div className="mb-4 bg-primary-50 rounded-lg p-3 text-sm text-slate-700">
            <p><strong>Fecha:</strong> {formatearFechaLegible(slotSeleccionado.fecha)}</p>
            <p><strong>Hora:</strong> {formatearHora(slotSeleccionado.horaInicio)} - {formatearHora(slotSeleccionado.horaFin)}</p>
            <p><strong>Doctor:</strong> Dr(a). {slotSeleccionado.doctorNombre}</p>
          </div>
        )}

        <label className="text-sm font-semibold text-slate-700 block mb-2">
          Motivo de la cita
        </label>
        <InputTextarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
          className="w-full"
          placeholder="Ejemplo: Dolor de estómago y vómitos"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Cancelar"
            className="!bg-primary hover:!bg-primary-hover !border-none !text-white !font-semibold !rounded-full !px-6 !py-2"
            onClick={cerrarModal}
            disabled={guardando}
          />
          <Button
            label={guardando ? "Agendando..." : "Confirmar"}
            className="!bg-white !border-2 !border-primary !text-primary hover:!bg-primary-50 !font-semibold !rounded-full !px-6 !py-2"
            onClick={confirmarAgendar}
            disabled={guardando}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default CitasPaciente;