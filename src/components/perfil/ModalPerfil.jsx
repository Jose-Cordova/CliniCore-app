import { useState, useEffect, useRef } from "react";
import { Dialog, InputText, Dropdown, Button, Toast } from "../../config/primeReact.jsx";
import { useAuth } from "../../auth/AuthContext";
import usuarioService from "../../services/usuarioService";
import { listarEspecialidades } from "../../services/especialidadesService";
import { mostrarErrorApi, mostrarExitoApi } from "../../utils/alertasApi";
import {
  validarEmail,
  validarNombreApellido,
  validarTelefonoElSalvador,
} from "../../utils/validaciones";

const ModalPerfil = ({ visible, onHide }) => {
  const { usuario, actualizarUsuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [especialidades, setEspecialidades] = useState([]);
  const [errores, setErrores] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    codigo: "",
    especialidadId: "",
  });
  const [enviando, setEnviando] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    if (visible) {
      cargarPerfil();
      cargarEspecialidades();
    }
  }, [visible]);

  const cargarPerfil = async () => {
    try {
      const data = await usuarioService.obtenerPerfil();
      setPerfil(data);
      setErrores({
        nombre: "",
        apellido: "",
        telefono: "",
        codigo: "",
        especialidadId: "",
      });
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudo cargar el perfil");
    }
  };

  const cargarEspecialidades = async () => {
    try {
      const lista = await listarEspecialidades();
      setEspecialidades(lista);
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudieron cargar las especialidades");
    }
  };

  const manejarCambio = (campo, valor) => {
    setPerfil((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, valor) }));
  };

  const manejarCambioNombreApellido = (campo, valor) => {
    const limpio = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s-]/g, "").replace(/-/g, "");
    setPerfil((prev) => ({ ...prev, [campo]: limpio }));
    setErrores((prev) => ({ ...prev, [campo]: validarCampo(campo, limpio) }));
  };

  const manejarCambioTelefono = (valor) => {
    let soloDigitos = valor.replace(/\D/g, "").slice(0, 8);
    let formateado = soloDigitos;
    if (soloDigitos.length > 4) {
      formateado = soloDigitos.slice(0, 4) + "-" + soloDigitos.slice(4);
    }
    setPerfil((prev) => ({ ...prev, telefono: formateado }));
    setErrores((prev) => ({ ...prev, telefono: validarCampo("telefono", formateado) }));
  };

  const validarCampo = (campo, valor) => {
    switch (campo) {
      case "nombre":
      case "apellido":
        return validarNombreApellido(valor);
      case "telefono":
        return validarTelefonoElSalvador(valor) ? "" : "Debe tener 8 dígitos";
      case "codigo":
        return valor && valor.trim().length >= 3
          ? ""
          : "Código colegiado requerido (mín. 3 caracteres)";
      case "especialidadId":
        return valor ? "" : "Seleccione una especialidad";
      default:
        return "";
    }
  };

  const guardarPerfil = async () => {
    if (!perfil) return;

    let hayErrores = false;
    const nuevosErrores = {};

    if (perfil.tipo === "DOCTOR") {
      for (const campo of ["nombre", "apellido", "telefono", "codigo", "especialidadId"]) {
        const error = validarCampo(campo, perfil[campo]);
        nuevosErrores[campo] = error;
        if (error) hayErrores = true;
      }
    }

    setErrores(nuevosErrores);
    if (hayErrores) {
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Revisa los campos en rojo" } },
      });
      return;
    }

    setEnviando(true);
    try {
      const datosLimpios = {
        ...perfil,
        telefono: perfil.telefono ? perfil.telefono.replace(/\D/g, "") : "",
        codigo: perfil.codigo ? perfil.codigo.trim().toUpperCase() : "",
      };
      const actualizado = await usuarioService.actualizarPerfil(datosLimpios);

      // Actualizar nombre en AuthContext si cambió
      if (actualizado.nombre && actualizado.nombre !== usuario.nombre) {
        actualizarUsuario({ nombre: actualizado.nombre });
      }

      mostrarExitoApi(toastRef, "Perfil actualizado correctamente");
      onHide();
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudo actualizar el perfil");
    } finally {
      setEnviando(false);
    }
  };

  const renderContenido = () => {
    if (!perfil) return <p className="text-sm text-slate-500">Cargando...</p>;

    if (perfil.tipo === "DOCTOR") {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <InputText value={perfil.email} disabled className="w-full h-10 px-3 text-sm bg-slate-100" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nombre(s) *
              </label>
              <InputText
                value={perfil.nombre}
                onChange={(e) => manejarCambioNombreApellido("nombre", e.target.value)}
                className={`w-full h-10 px-3 text-sm ${errores.nombre ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.nombre && <small className="text-red-500 text-xs mt-1 block">{errores.nombre}</small>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Apellido(s) *
              </label>
              <InputText
                value={perfil.apellido}
                onChange={(e) => manejarCambioNombreApellido("apellido", e.target.value)}
                className={`w-full h-10 px-3 text-sm ${errores.apellido ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.apellido && <small className="text-red-500 text-xs mt-1 block">{errores.apellido}</small>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono *
              </label>
              <InputText
                value={perfil.telefono}
                onChange={(e) => manejarCambioTelefono(e.target.value)}
                className={`w-full h-10 px-3 text-sm ${errores.telefono ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.telefono && <small className="text-red-500 text-xs mt-1 block">{errores.telefono}</small>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Código Colegiado *
              </label>
              <InputText
                value={perfil.codigo}
                onChange={(e) => manejarCambio("codigo", e.target.value)}
                className={`w-full h-10 px-3 text-sm ${errores.codigo ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {errores.codigo && <small className="text-red-500 text-xs mt-1 block">{errores.codigo}</small>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Especialidad *
            </label>
            <Dropdown
              value={perfil.especialidadId}
              options={especialidades.map((esp) => ({ label: esp.nombre, value: esp.id }))}
              onChange={(e) => manejarCambio("especialidadId", e.value)}
              placeholder="Selecciona especialidad"
              filter
              filterBy="label"
              showClear
              className={`w-full h-10 text-sm ${errores.especialidadId ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            {errores.especialidadId && <small className="text-red-500 text-xs mt-1 block">{errores.especialidadId}</small>}
          </div>
        </div>
      );
    }

    // ADMIN o PERSONAL
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Correo Electrónico
          </label>
          <InputText value={perfil.email} disabled className="w-full h-10 px-3 text-sm bg-slate-100" />
        </div>
        <p className="text-sm text-slate-500">
          Tu perfil no tiene campos editables. Si necesitas cambiar tu contraseña, usa la opción correspondiente.
        </p>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="pi pi-user text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Mi Perfil</h2>
              <p className="text-xs text-slate-500">Información personal y de acceso</p>
            </div>
          </div>
        }
        className="w-full max-w-xl mx-4"
        modal
      >
        {renderContenido()}

        <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary text-xs h-10 px-4"
            onClick={onHide}
          />
          {perfil?.tipo === "DOCTOR" && (
            <Button
              label={enviando ? "Guardando..." : "Guardar Cambios"}
              icon="pi pi-check"
              loading={enviando}
              className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md border-none"
              onClick={guardarPerfil}
            />
          )}
        </div>
      </Dialog>
    </>
  );
};

export default ModalPerfil;