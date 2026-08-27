import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button, InputText, Password, Toast } from "../config/primeReact.jsx";
import { useAuth } from "./AuthContext";
import axiosClient from "../services/axiosClient";
import { mostrarErrorApi, mostrarExitoApi } from "../utils/alertasApi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef(null);

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    try {
      const respuesta = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      login(respuesta.data.token);
      mostrarExitoApi(toastRef, "Sesión iniciada correctamente");
      navigate("/", { replace: true });
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudo iniciar sesión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <Toast ref={toastRef} position="top-right" />

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-soft-xl border border-slate-100 overflow-hidden grid lg:grid-cols-12 min-h-[620px] relative z-10">
        {/* Left Panel: Motivational Health Brand Experience */}
        <div className="lg:col-span-7 bg-gradient-to-br from-blue-50/90 via-slate-50/60 to-indigo-50/70 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
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
                <span className="hidden sm:inline-block bg-blue-100/80 text-blue-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Salud Digital
                </span>
              </div>
            </div>

            {/* Motivational Title with Sub-colors */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 leading-[1.2] tracking-tight">
                Tu bienestar integral en{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  las mejores manos.
                </span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg">
                Conectamos tu salud con especialistas de confianza. Agenda tus consultas médicas,
                consulta tu expediente y vive con la tranquilidad de estar siempre cuidado.
              </p>
            </div>

            {/* Highlights Cards */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <i className="pi pi-verified text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Especialistas Certificados</h3>
                  <p className="text-xs text-slate-500">Atención médica personalizada y de calidad garantizada.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <i className="pi pi-calendar-plus text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Gestión de Citas Inmediata</h3>
                  <p className="text-xs text-slate-500">Reserva, reprograma o consulta en cualquier momento.</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <i className="pi pi-shield text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Expediente Médico Protegido</h3>
                  <p className="text-xs text-slate-500">Tus diagnósticos e historial clínico 100% seguros.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Bottom Quote / Badge */}
          <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center gap-2 text-xs font-medium text-slate-500">
            <i className="pi pi-check-circle text-teal-500 text-sm" />
            <span>Plataforma médica diseñada para priorizar tu calidad de vida.</span>
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
                <i className="pi pi-lock text-[10px]" /> Acceso Seguro
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
                Iniciar Sesión
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Ingresa tus credenciales para acceder al sistema.
              </p>
            </div>

            <form onSubmit={manejarEnvio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="p-input-icon-left w-full">
                  <InputText
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@clinicore.com"
                    className="w-full h-11 px-3.5 text-sm"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                </div>
                <Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  feedback={false}
                  toggleMask
                  className="w-full"
                  inputClassName="w-full h-11 px-3.5 text-sm"
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  label={enviando ? "Ingresando..." : "Ingresar a mi cuenta"}
                  icon="pi pi-sign-in"
                  loading={enviando}
                  className="w-full h-11 pl-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/15 border-none font-semibold text-sm transition-all"
                />
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                ¿Aún no tienes expediente médico?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/registro")}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline ml-1"
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;