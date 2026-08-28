import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button, InputText, Password, Toast, Calendar, Dropdown } from "../config/primeReact.jsx";
import { useAuth } from "./AuthContext";
import axiosClient from "../services/axiosClient";
import { mostrarErrorApi, mostrarExitoApi } from "../utils/alertasApi";
import {
  validarEmail,
  validarContrasena,
  validarNombreApellido,
  validarFormatoDUI,
  validarDuiLocal,
  validarTelefonoElSalvador,
} from "../utils/validaciones";

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    dui: "",
    fechaNacimiento: null,
    genero: "",
    direccion: "",
    telefono: "",
    alergiaIntolerancia: "",
  });

  const [errores, setErrores] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    dui: "",
    fechaNacimiento: "",
    genero: "",
    direccion: "",
    telefono: "",
  });

  const [enviando, setEnviando] = useState(false);
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef(null);

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  const manejarCambio = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, valor) }));
  };

  const manejarCambioNombreApellido = (campo, valor) => {
    const limpio = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s-]/g, '').replace(/-/g, '');
    setForm((prev) => ({ ...prev, [campo]: limpio }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, limpio) }));
  };

  const manejarCambioDUI = (valor) => {
    let soloDigitos = valor.replace(/\D/g, '');
    soloDigitos = soloDigitos.slice(0, 9);
    let formateado = soloDigitos;
    if (soloDigitos.length > 8) {
      formateado = soloDigitos.slice(0, 8) + '-' + soloDigitos.slice(8);
    }
    setForm((prev) => ({ ...prev, dui: formateado }));
    setErrores((prev) => ({ ...prev, dui: validarCampo('dui', formateado) }));
  };

  const manejarCambioTelefono = (valor) => {
    let soloDigitos = valor.replace(/\D/g, '');
    soloDigitos = soloDigitos.slice(0, 8);
    let formateado = soloDigitos;
    if (soloDigitos.length > 4) {
      formateado = soloDigitos.slice(0, 4) + '-' + soloDigitos.slice(4);
    }
    setForm((prev) => ({ ...prev, telefono: formateado }));
    setErrores((prev) => ({ ...prev, telefono: validarCampo('telefono', formateado) }));
  };

  const validarCampo = (campo, valor) => {
    switch (campo) {
      case "email":
        return validarEmail(valor) ? "" : "Correo electrónico inválido";
      case "password":
        return validarContrasena(valor)
          ? ""
          : "Mínimo 8 caracteres, una mayúscula, un número y un símbolo";
      case "confirmPassword":
        return valor === form.password ? "" : "Las contraseñas no coinciden";
      case "nombre":
        return validarNombreApellido(valor);
      case "apellido":
        return validarNombreApellido(valor);
      case "dui":
        if (!validarFormatoDUI(valor)) return "Formato: 00000000-0";
        return validarDuiLocal(valor) ? "" : "DUI inválido";
      case "telefono":
        return validarTelefonoElSalvador(valor) ? "" : "Debe tener 8 dígitos";
      case "fechaNacimiento":
        return valor ? "" : "La fecha es obligatoria";
      case "genero":
        return valor ? "" : "Selecciona un género";
      case "direccion":
        return valor.trim().length >= 5 ? "" : "Debe tener al menos 5 caracteres";
      default:
        return "";
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const nuevosErrores = {};
    let hayErrores = false;

    for (const campo in form) {
      if (campo === "alergiaIntolerancia") continue;
      const error = validarCampo(campo, form[campo]);
      nuevosErrores[campo] = error;
      if (error) hayErrores = true;
    }

    setErrores(nuevosErrores);

    if (hayErrores) {
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Revisa los campos marcados en rojo" } },
      });
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await axiosClient.post("/auth/registro-paciente", {
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        apellido: form.apellido,
        dui: form.dui,
        fechaNacimiento: formatearFecha(form.fechaNacimiento),
        genero: form.genero,
        direccion: form.direccion,
        telefono: form.telefono.replace(/\D/g, ""),
        alergiaIntolerancia: form.alergiaIntolerancia,
      });
      login(respuesta.data.token);
      mostrarExitoApi(toastRef, "Registro exitoso, ¡bienvenido!");
      navigate("/", { replace: true });
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudo completar el registro");
    } finally {
      setEnviando(false);
    }
  };

  const generos = [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
    { label: "Otro", value: "O" },
  ];

  const claseError = (campo) => (errores[campo] ? "border-red-500 ring-1 ring-red-500" : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <Toast ref={toastRef} position="top-right" />

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-soft-xl border border-slate-100 overflow-hidden grid lg:grid-cols-12 relative z-10 my-4">
        {/* Left Panel: Motivational Healthcare Brand */}
        <div className="lg:col-span-4 bg-gradient-to-br from-blue-50/90 via-slate-50/60 to-indigo-50/70 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <i className="pi pi-heart text-lg font-bold" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-bold tracking-tight text-slate-900">
                  Clini<span className="text-blue-600">Core</span>
                </span>
              </div>
            </div>

            {/* Motivational Title with Sub-colors */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold">
                <i className="pi pi-user-plus text-[10px]" /> Registro de Pacientes
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 leading-tight">
                Empieza hoy tu camino hacia una{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  salud inteligente.
                </span>
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Crea tu cuenta de paciente para acceder a tu historial médico, agendar citas con especialistas y recibir seguimiento clínico continuo.
              </p>
            </div>

            {/* Highlights Cards */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                  <i className="pi pi-book text-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Expediente Centralizado</h3>
                  <p className="text-[11px] text-slate-500">Historial de consultas, recetas y diagnósticos en un solo lugar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                  <i className="pi pi-clock text-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Atención sin esperas</h3>
                  <p className="text-[11px] text-slate-500">Reserva con doctores certificados al horario que más te convenga.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                  <i className="pi pi-lock text-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">Privacidad Total</h3>
                  <p className="text-[11px] text-slate-500">Tus datos confidenciales bajo estrictos protocolos de seguridad.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Bottom Quote */}
          <div className="pt-6 mt-6 border-t border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
            <i className="pi pi-check-circle text-teal-500 text-sm" />
            <span>Atención cálida, profesional y accesible.</span>
          </div>
        </div>

        {/* Right Panel: Registration Form */}
        <div className="lg:col-span-8 p-6 sm:p-10 lg:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                Crear Expediente Digital
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Ingresa tu información para registrarte en el sistema. Los campos marcados con (*) son obligatorios.
              </p>
            </div>

            <form onSubmit={manejarEnvio} className="space-y-4">
              {/* Sección 1: Datos de Acceso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <InputText
                    type="email"
                    value={form.email}
                    onChange={(e) => manejarCambio("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={`w-full h-10 px-3 text-sm ${claseError("email")}`}
                    required
                  />
                  {errores.email && <small className="text-red-500 text-xs mt-1 block">{errores.email}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña *
                  </label>
                  <Password
                    value={form.password}
                    onChange={(e) => manejarCambio("password", e.target.value)}
                    placeholder="Mín. 8 caracteres"
                    feedback={false}
                    toggleMask
                    className="w-full"
                    inputClassName={`w-full h-10 px-3 text-sm ${claseError("password")}`}
                    required
                  />
                  {errores.password && <small className="text-red-500 text-xs mt-1 block">{errores.password}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirmar Contraseña *
                  </label>
                  <Password
                    value={form.confirmPassword}
                    onChange={(e) => manejarCambio("confirmPassword", e.target.value)}
                    placeholder="Repite la contraseña"
                    feedback={false}
                    toggleMask
                    className="w-full"
                    inputClassName={`w-full h-10 px-3 text-sm ${claseError("confirmPassword")}`}
                    required
                  />
                  {errores.confirmPassword && <small className="text-red-500 text-xs mt-1 block">{errores.confirmPassword}</small>}
                </div>
              </div>

              {/* Sección 2: Datos Personales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre(s) *
                  </label>
                  <InputText
                    value={form.nombre}
                    onChange={(e) => manejarCambioNombreApellido("nombre", e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    className={`w-full h-10 px-3 text-sm ${claseError("nombre")}`}
                    required
                  />
                  {errores.nombre && <small className="text-red-500 text-xs mt-1 block">{errores.nombre}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Apellido(s) *
                  </label>
                  <InputText
                    value={form.apellido}
                    onChange={(e) => manejarCambioNombreApellido("apellido", e.target.value)}
                    placeholder="Ej. Pérez García"
                    className={`w-full h-10 px-3 text-sm ${claseError("apellido")}`}
                    required
                  />
                  {errores.apellido && <small className="text-red-500 text-xs mt-1 block">{errores.apellido}</small>}
                </div>
              </div>

              {/* Sección 3: DUI, Fecha, Género, Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    DUI *
                  </label>
                  <InputText
                    value={form.dui}
                    onChange={(e) => manejarCambioDUI(e.target.value)}
                    placeholder="00000000-0"
                    className={`w-full h-10 px-3 text-sm ${claseError("dui")}`}
                    required
                  />
                  {errores.dui && <small className="text-red-500 text-xs mt-1 block">{errores.dui}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha Nacimiento *
                  </label>
                  <Calendar
                    value={form.fechaNacimiento}
                    onChange={(e) => manejarCambio("fechaNacimiento", e.value)}
                    dateFormat="yy-mm-dd"
                    showIcon
                    placeholder="AAAA-MM-DD"
                    className="w-full"
                    inputClassName={`w-full h-10 px-3 text-sm ${claseError("fechaNacimiento")}`}
                    required
                  />
                  {errores.fechaNacimiento && <small className="text-red-500 text-xs mt-1 block">{errores.fechaNacimiento}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Género *
                  </label>
                  <Dropdown
                    value={form.genero}
                    options={generos}
                    onChange={(e) => manejarCambio("genero", e.value)}
                    placeholder="Seleccionar"
                    className={`w-full h-10 text-sm ${claseError("genero")}`}
                    required
                  />
                  {errores.genero && <small className="text-red-500 text-xs mt-1 block">{errores.genero}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono *
                  </label>
                  <InputText
                    value={form.telefono}
                    onChange={(e) => manejarCambioTelefono(e.target.value)}
                    placeholder="7000-0000"
                    className={`w-full h-10 px-3 text-sm ${claseError("telefono")}`}
                    required
                  />
                  {errores.telefono && <small className="text-red-500 text-xs mt-1 block">{errores.telefono}</small>}
                </div>
              </div>

              {/* Sección 4: Dirección y Alergias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección de Residencia *
                  </label>
                  <InputText
                    value={form.direccion}
                    onChange={(e) => manejarCambio("direccion", e.target.value)}
                    placeholder="Colonia, calle, # de casa"
                    className={`w-full h-10 px-3 text-sm ${claseError("direccion")}`}
                    required
                  />
                  {errores.direccion && <small className="text-red-500 text-xs mt-1 block">{errores.direccion}</small>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Alergias o Intolerancias Médicas
                  </label>
                  <InputText
                    value={form.alergiaIntolerancia}
                    onChange={(e) => manejarCambio("alergiaIntolerancia", e.target.value)}
                    placeholder="Ej. Penicilina, polen, ninguna..."
                    className="w-full h-10 px-3 text-sm"
                  />
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  label={enviando ? "Creando tu expediente..." : "Completar Registro de Paciente"}
                  icon="pi pi-user-plus"
                  loading={enviando}
                  className="w-full h-11 pl-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/15 border-none font-semibold text-sm transition-all"
                />
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                ¿Ya tienes una cuenta registrada?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline ml-1"
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;