import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Password, Toast } from "../config/primeReact.jsx";
import { useAuth } from "./AuthContext.jsx";
import { mostrarErrorApi, mostrarExitoApi } from "../utils/alertasApi.js";

const CambiarContrasenia = () => {
  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [errores, setErrores] = useState({
    nuevaContrasenia: "",
    confirmacion: "",
  });
  const [enviando, setEnviando] = useState(false);
  const { cambiarContrasenia } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef(null);

  // Función de validación que devuelve un string de error o vacío
  const validarContrasena = (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 8) return "Debe tener al menos 8 caracteres";
    if (!/[a-z]/.test(password)) return "Debe incluir al menos una letra minúscula";
    if (!/[A-Z]/.test(password)) return "Debe incluir al menos una letra mayúscula";
    if (!/\d/.test(password)) return "Debe incluir al menos un número";
    if (!/[@$!%*?&]/.test(password)) return "Debe incluir al menos un símbolo (@$!%*?&)";
    return "";
  };

  const manejarCambioNueva = (valor) => {
    setNuevaContrasenia(valor);
    setErrores((prev) => ({ ...prev, nuevaContrasenia: validarContrasena(valor) }));
  };

  const manejarCambioConfirmacion = (valor) => {
    setConfirmacion(valor);
    setErrores((prev) => ({
      ...prev,
      confirmacion: valor === nuevaContrasenia ? "" : "Las contraseñas no coinciden",
    }));
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const errorNueva = validarContrasena(nuevaContrasenia);
    const errorConfirmacion = confirmacion === nuevaContrasenia ? "" : "Las contraseñas no coinciden";

    setErrores({
      nuevaContrasenia: errorNueva,
      confirmacion: errorConfirmacion,
    });

    if (errorNueva || errorConfirmacion) {
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Revisa los campos marcados en rojo" } },
      });
      return;
    }

    setEnviando(true);
    try {
      await cambiarContrasenia(nuevaContrasenia);
      mostrarExitoApi(toastRef, "Contraseña actualizada correctamente");
      navigate("/", { replace: true });
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudo cambiar la contraseña");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Toast ref={toastRef} position="top-right" />
      <form
        onSubmit={manejarEnvio}
        className="bg-white rounded-2xl shadow-soft-xl p-8 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-display font-bold text-slate-900">
          Actualizar Contraseña
        </h1>
        <p className="text-sm text-slate-500">
          Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Nueva Contraseña
          </label>
          <Password
            value={nuevaContrasenia}
            onChange={(e) => manejarCambioNueva(e.target.value)}
            placeholder="Mín. 8 caracteres"
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName={`w-full h-11 px-3 text-sm ${errores.nuevaContrasenia ? "border-red-500 ring-1 ring-red-500" : ""}`}
            required
          />
          {errores.nuevaContrasenia && (
            <small className="text-red-500 text-xs mt-1 block">{errores.nuevaContrasenia}</small>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Confirmar Contraseña
          </label>
          <Password
            value={confirmacion}
            onChange={(e) => manejarCambioConfirmacion(e.target.value)}
            placeholder="Repite la contraseña"
            feedback={false}
            toggleMask
            className="w-full"
            inputClassName={`w-full h-11 px-3 text-sm ${errores.confirmacion ? "border-red-500 ring-1 ring-red-500" : ""}`}
            required
          />
          {errores.confirmacion && (
            <small className="text-red-500 text-xs mt-1 block">{errores.confirmacion}</small>
          )}
        </div>

        <Button
          type="submit"
          label={enviando ? "Guardando..." : "Actualizar Contraseña"}
          icon="pi pi-save"
          loading={enviando}
          className="w-full h-11 pl-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/15 border-none font-semibold text-sm"
        />
      </form>
    </div>
  );
};

export default CambiarContrasenia;