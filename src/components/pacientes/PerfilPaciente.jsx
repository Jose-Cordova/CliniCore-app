import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputMask } from "primereact/inputmask";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useAuth } from "../../auth/AuthContext";
import { obtenerPacientePorId, actualizarPaciente } from "../../services/pacienteService";
import {
  validarNombreApellido,
  validarDuiLocal,
  validarTelefonoElSalvador,
} from "../../utils/validaciones";
import {
  mostrarExitoApi,
  mostrarErrorApi,
  mostrarAdvertenciaApi,
} from "../../utils/alertasApi";

const opcionesGenero = [
  { label: "Masculino", value: "Masculino" },
  { label: "Femenino", value: "Femenino" },
];

const PerfilPaciente = () => {
  const { usuario } = useAuth();
  const toastRef = useRef(null);
  const [paciente, setPaciente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dui: "",
    fechaNacimiento: null,
    genero: "Masculino",
    direccion: "",
    telefono: "",
    alergiaIntolerancia: "",
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarDatosPaciente();
  }, [usuario]);

  const cargarDatosPaciente = async () => {
    if (!usuario?.pacienteId) {
      setCargando(false);
      return;
    }
    try {
      setCargando(true);
      const data = await obtenerPacientePorId(usuario.pacienteId);
      setPaciente(data);
      prepararFormulario(data);
    } catch (error) {
      console.error("Error al cargar perfil de paciente:", error);
      mostrarErrorApi(toastRef, error, "No se pudieron cargar los datos de su expediente.");
    } finally {
      setCargando(false);
    }
  };

  const prepararFormulario = (data) => {
    setFormData({
      nombre: data.nombre || "",
      apellido: data.apellido || "",
      dui: data.dui || "",
      fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento + "T00:00:00") : null,
      genero: data.genero || "Masculino",
      direccion: data.direccion || "",
      telefono: data.telefono || "",
      alergiaIntolerancia: data.alergiaIntolerancia || "",
    });
    setErrores({});
  };

  const abrirModalEditar = () => {
    if (paciente) {
      prepararFormulario(paciente);
    }
    setModalVisible(true);
  };

  // Para InputText / InputTextarea (eventos nativos: e.target.name/value)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDuiChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    let formatted = raw;
    if (raw.length > 8) {
      formatted = `${raw.slice(0, 8)}-${raw.slice(8)}`;
    } else if (raw.length === 8) {
      formatted = `${raw}-`;
    }
    setFormData((prev) => ({ ...prev, dui: formatted }));
    if (errores.dui) setErrores((prev) => ({ ...prev, dui: "" }));
  };

  const handleTelefonoChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = raw;
    if (raw.length > 4) {
      formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    }
    setFormData((prev) => ({ ...prev, telefono: formatted }));
    if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: "" }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const errNombre = validarNombreApellido(formData.nombre);
    if (errNombre) nuevosErrores.nombre = errNombre;

    const errApellido = validarNombreApellido(formData.apellido);
    if (errApellido) nuevosErrores.apellido = errApellido;

    if (!validarDuiLocal(formData.dui)) {
      nuevosErrores.dui = "DUI inválido. Formato esperado: 00000000-0 con dígito verificador correcto.";
    }

    if (!formData.fechaNacimiento) {
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    }

    if (!validarTelefonoElSalvador(formData.telefono)) {
      nuevosErrores.telefono = "Debe ser un número telefónico de 8 dígitos de El Salvador.";
    }

    if (!formData.direccion || formData.direccion.trim().length < 5) {
      nuevosErrores.direccion = "La dirección debe tener al menos 5 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      mostrarAdvertenciaApi(toastRef, "Por favor corrija los errores en el formulario.");
      return;
    }

    try {
      setGuardando(true);
      const fechaFormateada = formData.fechaNacimiento.toISOString().split("T")[0];

      const payload = {
        id: paciente.id,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        dui: formData.dui.trim(),
        fechaNacimiento: fechaFormateada,
        genero: formData.genero,
        direccion: formData.direccion.trim(),
        telefono: formData.telefono.trim(),
        alergiaIntolerancia: formData.alergiaIntolerancia.trim(),
        usuarioId: usuario?.id || paciente.usuarioId,
      };

      const respuesta = await actualizarPaciente(paciente.id, payload);
      const pacienteActualizado = respuesta?.paciente ?? respuesta;
      setPaciente(pacienteActualizado);
      setModalVisible(false);
      mostrarExitoApi(toastRef, "Expediente actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar paciente:", error);
      mostrarErrorApi(toastRef, error, "Ocurrió un error al actualizar los datos.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <ProgressSpinner />
        <p className="mt-4 text-slate-600 font-medium">Cargando su expediente...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-6">
        <Toast ref={toastRef} />
        <Card title="Expediente no encontrado">
          <p className="text-slate-600">
            No se encontraron datos de expediente asociados a esta cuenta.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <Toast ref={toastRef} />

      {/* Cabecera del Expediente */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
            {paciente.nombre?.charAt(0)}
            {paciente.apellido?.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {paciente.nombre} {paciente.apellido}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded font-semibold">
                Expediente: {paciente.codigoExpediente}
              </span>
              <span>• Registrado el: {paciente.fechaRegistro}</span>
            </p>
          </div>
        </div>
        <Button
          label="Editar Datos de Expediente"
          icon="pi pi-user-edit"
          className="p-button-primary"
          onClick={abrirModalEditar}
        />
      </div>

      {/* Tarjeta 1: Información Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Información Personal" className="shadow-sm border border-slate-200">
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-user text-blue-600 text-xs" />
                <span>Nombre Completo</span>
              </span>
              <span className="text-slate-800 font-semibold text-base">
                {paciente.nombre} {paciente.apellido}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-id-card text-blue-600 text-xs" />
                <span>DUI</span>
              </span>
              <span className="text-slate-800 font-semibold">{paciente.dui}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-calendar text-blue-600 text-xs" />
                <span>Fecha de Nacimiento</span>
              </span>
              <span className="text-slate-800 font-semibold">{paciente.fechaNacimiento}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-venus-mars text-blue-600 text-xs" />
                <span>Género</span>
              </span>
              <span className="text-slate-800 font-semibold">{paciente.genero}</span>
            </div>
          </div>
        </Card>

        {/* Tarjeta 2: Contacto y Salud */}
        <Card title="Contacto y Datos Médicos" className="shadow-sm border border-slate-200">
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-phone text-blue-600 text-xs" />
                <span>Teléfono de Contacto</span>
              </span>
              <span className="text-slate-800 font-semibold">{paciente.telefono}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-map-marker text-blue-600 text-xs" />
                <span>Dirección de Residencia</span>
              </span>
              <span className="text-slate-800 font-semibold">{paciente.direccion}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block flex items-center gap-1.5 mb-0.5">
                <i className="pi pi-exclamation-triangle text-amber-500 text-xs" />
                <span>Alergias o Intolerancias</span>
              </span>
              <span className={`font-semibold ${paciente.alergiaIntolerancia ? 'text-amber-600' : 'text-slate-500'}`}>
                {paciente.alergiaIntolerancia || "Ninguna registrada"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Edición de Expediente */}
      <Dialog
        visible={modalVisible}
        onHide={() => setModalVisible(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center backdrop-blur-sm">
              <i className="pi pi-user-edit text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Editar Datos de Mi Expediente</h2>
              <p className="text-xs text-slate-500">Actualiza tu información personal y datos de contacto.</p>
            </div>
          </div>
        }
        className="w-full max-w-2xl mx-4"
        modal
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-user text-blue-600 text-xs" />
                <span>Nombre *</span>
              </label>
              <InputText
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className={`w-full h-10 px-3.5 text-sm ${errores.nombre ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.nombre && <small className="text-red-500 text-xs mt-1 block">{errores.nombre}</small>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-user text-blue-600 text-xs" />
                <span>Apellido *</span>
              </label>
              <InputText
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                className={`w-full h-10 px-3.5 text-sm ${errores.apellido ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.apellido && <small className="text-red-500 text-xs mt-1 block">{errores.apellido}</small>}
            </div>
          </div>

          {/* DUI y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-id-card text-blue-600 text-xs" />
                <span>DUI *</span>
              </label>
              <InputText
                name="dui"
                value={formData.dui}
                onChange={handleDuiChange}
                placeholder="00000000-0"
                maxLength={10}
                className={`w-full h-10 px-3.5 text-sm ${errores.dui ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.dui && <small className="text-red-500 text-xs mt-1 block">{errores.dui}</small>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-phone text-blue-600 text-xs" />
                <span>Teléfono *</span>
              </label>
              <InputText
                name="telefono"
                value={formData.telefono}
                onChange={handleTelefonoChange}
                placeholder="7000-0000"
                maxLength={9}
                className={`w-full h-10 px-3.5 text-sm ${errores.telefono ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.telefono && <small className="text-red-500 text-xs mt-1 block">{errores.telefono}</small>}
            </div>
          </div>

          {/* Fecha de nacimiento y Género */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-calendar text-blue-600 text-xs" />
                <span>Fecha de Nacimiento *</span>
              </label>
              <Calendar
                value={formData.fechaNacimiento}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, fechaNacimiento: e.value }));
                  if (errores.fechaNacimiento) setErrores((prev) => ({ ...prev, fechaNacimiento: "" }));
                }}
                dateFormat="yy-mm-dd"
                showIcon
                placeholder="AAAA-MM-DD"
                className={`w-full ${errores.fechaNacimiento ? "p-invalid" : ""}`}
                inputClassName="h-10 px-3.5 text-sm w-full"
              />
              {errores.fechaNacimiento && <small className="text-red-500 text-xs mt-1 block">{errores.fechaNacimiento}</small>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-venus-mars text-blue-600 text-xs" />
                <span>Género</span>
              </label>
              <Dropdown
                value={formData.genero}
                options={opcionesGenero}
                onChange={(e) => setFormData((prev) => ({ ...prev, genero: e.value }))}
                className="w-full h-10 text-sm"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-map-marker text-blue-600 text-xs" />
              <span>Dirección de Residencia *</span>
            </label>
            <InputTextarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              rows={2}
              placeholder="Ingrese la dirección completa..."
              className={`w-full p-3 text-sm ${errores.direccion ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            {errores.direccion && <small className="text-red-500 text-xs mt-1 block">{errores.direccion}</small>}
          </div>

          {/* Alergias */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-exclamation-triangle text-amber-500 text-xs" />
              <span>Alergias o Intolerancias (Opcional)</span>
            </label>
            <InputTextarea
              name="alergiaIntolerancia"
              value={formData.alergiaIntolerancia}
              onChange={handleChange}
              rows={2}
              placeholder="Ej: Penicilina, Mariscos, Ninguna..."
              className="w-full p-3 text-sm"
            />
          </div>

          {/* Footer del Modal */}
          <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
            <Button
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text p-button-secondary text-xs h-10 px-4"
              onClick={() => setModalVisible(false)}
            />
            <Button
              type="submit"
              label={guardando ? "Guardando..." : "Guardar Cambios"}
              icon="pi pi-check"
              loading={guardando}
              className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md border-none"
            />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default PerfilPaciente;