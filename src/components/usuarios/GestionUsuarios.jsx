import { useState, useEffect, useRef, useCallback } from "react";
import {
  Button,
  DataTable,
  Column,
  InputText,
  Dialog,
  Dropdown,
  Toast,
} from "../../config/primeReact.jsx";
import axiosClient from "../../services/axiosClient";
import { mostrarErrorApi, mostrarExitoApi } from "../../utils/alertasApi";
import { listarEspecialidades, crearEspecialidad } from "../../services/especialidadesService";
import {
  validarEmail,
  validarNombreApellido,
  validarTelefonoElSalvador,
} from "../../utils/validaciones";
import Swal from "sweetalert2";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [modalDoctor, setModalDoctor] = useState(false);
  const [modalPersonal, setModalPersonal] = useState(false);
  const [modalAdmin, setModalAdmin] = useState(false);
  const [modalNuevaEspecialidad, setModalNuevaEspecialidad] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);

  const [formDoctor, setFormDoctor] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    codigo: "",
    especialidadId: null,
  });

  const [erroresDoctor, setErroresDoctor] = useState({
    email: "",
    nombre: "",
    apellido: "",
    telefono: "",
    codigo: "",
    especialidadId: "",
  });

  const [formPersonal, setFormPersonal] = useState({ email: "" });
  const [errorPersonal, setErrorPersonal] = useState("");

  const [formAdmin, setFormAdmin] = useState({ email: "" });
  const [errorAdmin, setErrorAdmin] = useState("");

  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [errorEspecialidad, setErrorEspecialidad] = useState("");

  const [enviando, setEnviando] = useState(false);
  const toastRef = useRef(null);

  const cargarUsuarios = useCallback(async () => {
    try {
      const respuesta = await axiosClient.get("/usuarios");
      setUsuarios(respuesta.data);
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarEspecialidades = useCallback(async () => {
    try {
      const lista = await listarEspecialidades();
      setEspecialidades(lista);
    } catch (error) {
      mostrarErrorApi(toastRef, error, "No se pudieron cargar las especialidades");
    }
  }, []);

  useEffect(() => {
    let montado = true;
    const ejecutarCarga = async () => {
      try {
        const [respUsuarios, listaEsp] = await Promise.all([
          axiosClient.get("/usuarios"),
          listarEspecialidades(),
        ]);
        if (montado) {
          setUsuarios(respUsuarios.data);
          setEspecialidades(listaEsp);
        }
      } catch (error) {
        if (montado) {
          mostrarErrorApi(toastRef, error, "Error al sincronizar datos");
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    ejecutarCarga();
    return () => {
      montado = false;
    };
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termino = filtro.toLowerCase();
    const email = (usuario.email || "").toLowerCase();
    const nombre = (usuario.nombre || "").toLowerCase();
    const apellido = (usuario.apellido || "").toLowerCase();
    const rol = (usuario.rol || "").toLowerCase();
    const tipo = (usuario.tipo || "").toLowerCase();
    return (
      email.includes(termino) ||
      nombre.includes(termino) ||
      apellido.includes(termino) ||
      rol.includes(termino) ||
      tipo.includes(termino)
    );
  });

  const validarCampoDoctor = (campo, valor) => {
    switch (campo) {
      case "email":
        return validarEmail(valor) ? "" : "Correo electrónico inválido";
      case "nombre":
      case "apellido":
        return validarNombreApellido(valor);
      case "telefono":
        return validarTelefonoElSalvador(valor) ? "" : "Debe tener 8 dígitos válidos";
      case "codigo":
        return valor && valor.trim().length >= 3
          ? ""
          : "Código colegiado requerido (mín. 3 caracteres)";
      case "especialidadId":
        return valor ? "" : "Selecciona una especialidad médica";
      default:
        return "";
    }
  };

  const manejarCambioDoctor = (campo, valor) => {
    setFormDoctor((prev) => ({ ...prev, [campo]: valor }));
    setErroresDoctor((prev) => ({ ...prev, [campo]: validarCampoDoctor(campo, valor) }));
  };

  const manejarCambioDoctorNombre = (campo, valor) => {
    const limpio = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s-]/g, "").replace(/-/g, "");
    setFormDoctor((prev) => ({ ...prev, [campo]: limpio }));
    setErroresDoctor((prev) => ({ ...prev, [campo]: validarCampoDoctor(campo, limpio) }));
  };

  const manejarCambioDoctorTelefono = (valor) => {
    let soloDigitos = valor.replace(/\D/g, "").slice(0, 8);
    let formateado = soloDigitos;
    if (soloDigitos.length > 4) {
      formateado = soloDigitos.slice(0, 4) + "-" + soloDigitos.slice(4);
    }
    setFormDoctor((prev) => ({ ...prev, telefono: formateado }));
    setErroresDoctor((prev) => ({ ...prev, telefono: validarCampoDoctor("telefono", formateado) }));
  };

  const registrarDoctor = async () => {
    const nuevosErrores = {};
    let hayErrores = false;

    for (const campo of ["email", "nombre", "apellido", "telefono", "codigo", "especialidadId"]) {
      const error = validarCampoDoctor(campo, formDoctor[campo]);
      nuevosErrores[campo] = error;
      if (error) hayErrores = true;
    }

    setErroresDoctor(nuevosErrores);

    if (hayErrores) {
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Por favor revisa los campos en rojo" } },
      });
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        ...formDoctor,
        telefono: formDoctor.telefono.replace(/\D/g, ""),
      };
      const respuesta = await axiosClient.post("/auth/registro-doctor", payload);
      mostrarExitoApi(toastRef, "Doctor registrado correctamente");
      if (respuesta.data.contraseniaTemporal) {
        mostrarContraseniaTemporal(respuesta.data.contraseniaTemporal);
      }
      setModalDoctor(false);
      setFormDoctor({
        email: "",
        nombre: "",
        apellido: "",
        telefono: "",
        codigo: "",
        especialidadId: null,
      });
      setErroresDoctor({
        email: "",
        nombre: "",
        apellido: "",
        telefono: "",
        codigo: "",
        especialidadId: "",
      });
      cargarUsuarios();
    } catch (error) {
      mostrarErrorApi(toastRef, error);
    } finally {
      setEnviando(false);
    }
  };

  const registrarPersonal = async () => {
    if (!validarEmail(formPersonal.email)) {
      setErrorPersonal("Correo electrónico inválido");
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Ingresa un correo electrónico válido" } },
      });
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await axiosClient.post("/auth/registro-personal", formPersonal);
      mostrarExitoApi(toastRef, "Personal registrado correctamente");
      if (respuesta.data.contraseniaTemporal) {
        mostrarContraseniaTemporal(respuesta.data.contraseniaTemporal);
      }
      setModalPersonal(false);
      setFormPersonal({ email: "" });
      setErrorPersonal("");
      cargarUsuarios();
    } catch (error) {
      mostrarErrorApi(toastRef, error);
    } finally {
      setEnviando(false);
    }
  };

  const registrarAdmin = async () => {
    if (!validarEmail(formAdmin.email)) {
      setErrorAdmin("Correo electrónico inválido");
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: "Ingresa un correo electrónico válido" } },
      });
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await axiosClient.post("/auth/registro-admin", formAdmin);
      mostrarExitoApi(toastRef, "Administrador registrado correctamente");
      if (respuesta.data.contraseniaTemporal) {
        mostrarContraseniaTemporal(respuesta.data.contraseniaTemporal);
      }
      setModalAdmin(false);
      setFormAdmin({ email: "" });
      setErrorAdmin("");
      cargarUsuarios();
    } catch (error) {
      mostrarErrorApi(toastRef, error);
    } finally {
      setEnviando(false);
    }
  };

  const crearNuevaEspecialidad = async () => {
    const error = validarNombreApellido(nuevaEspecialidad);
    if (error) {
      setErrorEspecialidad(error);
      mostrarErrorApi(toastRef, {
        response: { status: 400, data: { message: error } },
      });
      return;
    }

    setEnviando(true);
    try {
      const nueva = await crearEspecialidad(nuevaEspecialidad.trim());
      setNuevaEspecialidad("");
      setErrorEspecialidad("");
      setModalNuevaEspecialidad(false);
      await cargarEspecialidades();
      setFormDoctor((prev) => ({ ...prev, especialidadId: nueva.id }));
      setErroresDoctor((prev) => ({ ...prev, especialidadId: "" }));
      mostrarExitoApi(toastRef, "Especialidad creada y asignada con éxito");
    } catch (error) {
      mostrarErrorApi(toastRef, error);
    } finally {
      setEnviando(false);
    }
  };

  const mostrarContraseniaTemporal = (contrasenia) => {
    Swal.fire({
      icon: "info",
      title: "Contraseña Temporal Asignada",
      html: `
        <p class="text-sm text-slate-600 mb-2">La contraseña temporal generada para el usuario es:</p>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl font-mono text-xl font-bold text-blue-700 select-all my-2">
          ${contrasenia}
        </div>
        <p class="text-xs text-slate-500 mt-2">Cópiala y compártela de forma segura con el nuevo usuario.</p>
      `,
      confirmButtonText: "Entendido y Copiado",
      confirmButtonColor: "#2563EB",
      customClass: {
        popup: "rounded-2xl shadow-xl font-sans",
        confirmButton: "rounded-xl font-semibold px-5 py-2 text-sm",
      },
    });
  };

  const confirmarCambioEstado = async (usuario) => {
    if (usuario.rol === "ADMIN") {
      mostrarErrorApi(toastRef, {
        response: {
          status: 400,
          data: { message: "No se puede cambiar el estado de un administrador" },
        },
      });
      return;
    }

    const accion = usuario.estado ? "inactivar" : "activar";
    const resultado = await Swal.fire({
      title: `¿Deseas ${accion} a este usuario?`,
      html: `<p class="text-sm text-slate-600">El usuario <strong>${
        usuario.nombre || usuario.email
      }</strong> ${
        usuario.estado
          ? "perderá temporalmente el acceso al portal hasta ser reactivado."
          : "podrá volver a acceder al sistema normalmente."
      }</p>`,
      icon: usuario.estado ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: usuario.estado ? "#EF4444" : "#2563EB",
      cancelButtonColor: "#64748B",
      customClass: {
        popup: "rounded-2xl shadow-2xl border border-slate-100 font-sans",
        confirmButton: "rounded-xl font-semibold px-4 py-2 text-sm",
        cancelButton: "rounded-xl font-semibold px-4 py-2 text-sm",
      },
    });

    if (resultado.isConfirmed) {
      try {
        await axiosClient.patch(`/usuarios/${usuario.id}/estado`, {
          estado: !usuario.estado,
        });
        mostrarExitoApi(
          toastRef,
          `Usuario ${usuario.estado ? "inactivado" : "activado"} correctamente`
        );
        cargarUsuarios();
      } catch (error) {
        mostrarErrorApi(toastRef, error);
      }
    }
  };

  const actionBody = (rowData) => {
    const esAdmin = rowData.rol === "ADMIN";
    const estaActivo = rowData.estado;

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={esAdmin}
          onClick={() => confirmarCambioEstado(rowData)}
          title={
            esAdmin
              ? "No editable"
              : estaActivo
              ? "Clic para inactivar usuario"
              : "Clic para activar usuario"
          }
          className={`
            px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 shadow-sm border
            ${
              esAdmin
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60"
                : estaActivo
                ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 active:scale-95"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800 hover:border-slate-300 active:scale-95"
            }
          `}
        >
          <i
            className={`pi ${
              estaActivo ? "pi-user-minus text-blue-600" : "pi-user-plus text-slate-600"
            } text-xs`}
          />
          <span>{estaActivo ? "Inactivar" : "Activar"}</span>
        </button>
      </div>
    );
  };

  const renderBadgeRol = (rol) => {
    switch (rol) {
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <i className="pi pi-shield text-[10px]" /> Administrador
          </span>
        );
      case "MEDICO":
      case "DOCTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <i className="pi pi-user text-[10px]" /> Médico
          </span>
        );
      case "RECEPCIONISTA":
      case "PERSONAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <i className="pi pi-users text-[10px]" /> Personal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <i className="pi pi-user text-[10px]" /> {rol || "Paciente"}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto font-sans">
      <Toast ref={toastRef} position="top-right" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <i className="pi pi-users text-base" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Panel Administrativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Gestión de{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Usuarios
            </span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Administra roles, accesos y credenciales de médicos, personal y administradores.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            label="Nuevo Doctor"
            icon="pi pi-user"
            className="h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/15 border-none transition-all"
            onClick={() => setModalDoctor(true)}
          />
          <Button
            label="Nuevo Personal"
            icon="pi pi-user-plus"
            className="h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md shadow-teal-500/15 border-none transition-all"
            onClick={() => setModalPersonal(true)}
          />
          <Button
            label="Nuevo Admin"
            icon="pi pi-shield"
            className="h-10 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/15 border-none transition-all"
            onClick={() => setModalAdmin(true)}
          />
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-80 md:w-96">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
            <InputText
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full h-10 pl-11 pr-4 text-xs sm:text-sm bg-white"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 font-medium">
            <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200">
              Total: <strong>{usuariosFiltrados.length}</strong> usuarios
            </span>
          </div>
        </div>

        {/* DataTable with Selectable Rows-Per-Page Paginator */}
        <DataTable
          value={usuariosFiltrados}
          loading={cargando}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 20, 50]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          paginatorClassName="rounded-b-3xl border-t border-slate-100 bg-white px-4 py-2 text-xs font-medium"
          className="p-datatable-sm"
          emptyMessage={
            <div className="text-center py-10 text-slate-400">
              <i className="pi pi-users text-4xl mb-2 block" />
              <span>No se encontraron usuarios registrados.</span>
            </div>
          }
        >
          <Column
            header="Usuario"
            sortable
            field="nombre"
            body={(rowData) => (
              <div className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                  {rowData.nombre ? rowData.nombre.charAt(0) : (rowData.email ? rowData.email.charAt(0) : "U")}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <i className="pi pi-user text-blue-600 text-xs" />
                    <span>{rowData.nombre ? `${rowData.nombre} ${rowData.apellido || ""}` : "Sin nombre registrado"}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <i className="pi pi-envelope text-slate-400 text-[10px]" />
                    <span>{rowData.email}</span>
                  </div>
                </div>
              </div>
            )}
          />
          <Column
            field="rol"
            header="Rol Asignado"
            sortable
            body={(rowData) => renderBadgeRol(rowData.rol)}
          />
          <Column
            field="estado"
            header="Estado"
            sortable
            body={(rowData) => (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  rowData.estado
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    rowData.estado ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {rowData.estado ? "Activo" : "Inactivo"}
              </span>
            )}
          />
          <Column header="Acciones" body={actionBody} style={{ width: "140px" }} />
        </DataTable>
      </div>

      {/* ========================================================
          MODAL 1: REGISTRAR DOCTOR (Validaciones estilizadas)
         ======================================================== */}
      <Dialog
        visible={modalDoctor}
        onHide={() => setModalDoctor(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="pi pi-user text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Registrar Doctor</h2>
              <p className="text-xs text-slate-500">Credenciales para un nuevo médico.</p>
            </div>
          </div>
        }
        className="w-full max-w-xl mx-4"
        modal
      >
        <div className="space-y-4 pt-2">
          {/* Correo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-envelope text-blue-600 text-xs" />
              <span>Correo Electrónico *</span>
            </label>
            <InputText
              placeholder="doctor@clinicore.com"
              value={formDoctor.email}
              onChange={(e) => manejarCambioDoctor("email", e.target.value)}
              className={`w-full h-10 px-3.5 text-sm ${erroresDoctor.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            {erroresDoctor.email && (
              <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.email}</small>
            )}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-user text-blue-600 text-xs" />
                <span>Nombre(s) *</span>
              </label>
              <InputText
                placeholder="Ej. Carlos Roberto"
                value={formDoctor.nombre}
                onChange={(e) => manejarCambioDoctorNombre("nombre", e.target.value)}
                className={`w-full h-10 px-3.5 text-sm ${erroresDoctor.nombre ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {erroresDoctor.nombre && (
                <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.nombre}</small>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-user text-blue-600 text-xs" />
                <span>Apellido(s) *</span>
              </label>
              <InputText
                placeholder="Ej. Mendoza Cruz"
                value={formDoctor.apellido}
                onChange={(e) => manejarCambioDoctorNombre("apellido", e.target.value)}
                className={`w-full h-10 px-3.5 text-sm ${erroresDoctor.apellido ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {erroresDoctor.apellido && (
                <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.apellido}</small>
              )}
            </div>
          </div>

          {/* Teléfono y Código Colegiado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-phone text-blue-600 text-xs" />
                <span>Teléfono de Contacto *</span>
              </label>
              <InputText
                placeholder="7000-0000"
                value={formDoctor.telefono}
                onChange={(e) => manejarCambioDoctorTelefono(e.target.value)}
                className={`w-full h-10 px-3.5 text-sm ${erroresDoctor.telefono ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {erroresDoctor.telefono && (
                <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.telefono}</small>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <i className="pi pi-id-card text-blue-600 text-xs" />
                <span>Código Colegiado / Licencia *</span>
              </label>
              <InputText
                placeholder="MED-12345"
                value={formDoctor.codigo}
                onChange={(e) => manejarCambioDoctor("codigo", e.target.value)}
                className={`w-full h-10 px-3.5 text-sm ${erroresDoctor.codigo ? "border-red-500 ring-1 ring-red-500" : ""}`}
              />
              {erroresDoctor.codigo && (
                <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.codigo}</small>
              )}
            </div>
          </div>

          {/* Especialidad con búsqueda */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <i className="pi pi-list text-blue-600 text-xs" />
                <span>Especialidad Médica *</span>
              </label>
              <button
                type="button"
                onClick={() => setModalNuevaEspecialidad(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1"
              >
                <i className="pi pi-plus text-[10px]" /> Nueva Especialidad
              </button>
            </div>
            <Dropdown
              value={formDoctor.especialidadId}
              options={especialidades.map((esp) => ({ label: esp.nombre, value: esp.id }))}
              onChange={(e) => manejarCambioDoctor("especialidadId", e.value)}
              placeholder="Buscar o seleccionar especialidad médica..."
              filter
              filterBy="label"
              filterPlaceholder="Escribe para buscar especialidad..."
              showClear
              className={`w-full h-10 text-sm ${erroresDoctor.especialidadId ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            {erroresDoctor.especialidadId && (
              <small className="text-red-500 text-xs mt-1 block">{erroresDoctor.especialidadId}</small>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary text-xs h-10 px-4"
            onClick={() => setModalDoctor(false)}
          />
          <Button
            label={enviando ? "Registrando..." : "Registrar Doctor"}
            icon="pi pi-check"
            loading={enviando}
            className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md border-none"
            onClick={registrarDoctor}
          />
        </div>
      </Dialog>

      {/* ========================================================
          MODAL 2: REGISTRAR PERSONAL (RECEPCIONISTA / ASISTENTE)
         ======================================================== */}
      <Dialog
        visible={modalPersonal}
        onHide={() => setModalPersonal(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <i className="pi pi-user-plus text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Registrar Personal</h2>
              <p className="text-xs text-slate-500">Asistentes clínicos.</p>
            </div>
          </div>
        }
        className="w-full max-w-md mx-4"
        modal
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-envelope text-teal-600 text-xs" />
              <span>Correo Electrónico *</span>
            </label>
            <InputText
              placeholder="personal@clinicore.com"
              value={formPersonal.email}
              onChange={(e) => {
                setFormPersonal({ email: e.target.value });
                setErrorPersonal(validarEmail(e.target.value) ? "" : "Correo electrónico inválido");
              }}
              className={`w-full h-10 px-3.5 text-sm ${errorPersonal ? "border-red-500 ring-1 ring-red-500" : ""}`}
              autoFocus
            />
            {errorPersonal && (
              <small className="text-red-500 text-xs mt-1 block">{errorPersonal}</small>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Se generará una contraseña temporal para su primer acceso.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary text-xs h-10 px-4"
            onClick={() => setModalPersonal(false)}
          />
          <Button
            label={enviando ? "Registrando..." : "Registrar Personal"}
            icon="pi pi-check"
            loading={enviando}
            className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl shadow-md border-none"
            onClick={registrarPersonal}
          />
        </div>
      </Dialog>

      {/* ========================================================
          MODAL 3: REGISTRAR ADMINISTRADOR
         ======================================================== */}
      <Dialog
        visible={modalAdmin}
        onHide={() => setModalAdmin(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <i className="pi pi-shield text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Registrar Administrador</h2>
              <p className="text-xs text-slate-500">Acceso con privilegios de gestión total del sistema.</p>
            </div>
          </div>
        }
        className="w-full max-w-md mx-4"
        modal
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-envelope text-purple-600 text-xs" />
              <span>Correo Electrónico *</span>
            </label>
            <InputText
              placeholder="admin@clinicore.com"
              value={formAdmin.email}
              onChange={(e) => {
                setFormAdmin({ email: e.target.value });
                setErrorAdmin(validarEmail(e.target.value) ? "" : "Correo electrónico inválido");
              }}
              className={`w-full h-10 px-3.5 text-sm ${errorAdmin ? "border-red-500 ring-1 ring-red-500" : ""}`}
              autoFocus
            />
            {errorAdmin && (
              <small className="text-red-500 text-xs mt-1 block">{errorAdmin}</small>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Se creará la cuenta con rol ADMIN y contraseña temporal de acceso.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary text-xs h-10 px-4"
            onClick={() => setModalAdmin(false)}
          />
          <Button
            label={enviando ? "Registrando..." : "Registrar Administrador"}
            icon="pi pi-check"
            loading={enviando}
            className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-md border-none"
            onClick={registrarAdmin}
          />
        </div>
      </Dialog>

      {/* ========================================================
          MODAL 4: NUEVA ESPECIALIDAD MÉDICA
         ======================================================== */}
      <Dialog
        visible={modalNuevaEspecialidad}
        onHide={() => setModalNuevaEspecialidad(false)}
        header={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <i className="pi pi-plus text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-slate-900">Nueva Especialidad</h2>
              <p className="text-xs text-slate-500">Agrega una rama médica para asignarla a los doctores.</p>
            </div>
          </div>
        }
        className="w-full max-w-md mx-4"
        modal
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <i className="pi pi-tag text-blue-600 text-xs" />
              <span>Nombre de la Especialidad *</span>
            </label>
            <InputText
              placeholder="Ej. Cardiología, Pediatría, Dermatología..."
              value={nuevaEspecialidad}
              onChange={(e) => {
                setNuevaEspecialidad(e.target.value);
                setErrorEspecialidad(validarNombreApellido(e.target.value));
              }}
              className={`w-full h-10 px-3.5 text-sm ${errorEspecialidad ? "border-red-500 ring-1 ring-red-500" : ""}`}
              autoFocus
            />
            {errorEspecialidad && (
              <small className="text-red-500 text-xs mt-1 block">{errorEspecialidad}</small>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-6 mt-4 border-t border-slate-100">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text p-button-secondary text-xs h-10 px-4"
            onClick={() => setModalNuevaEspecialidad(false)}
          />
          <Button
            label={enviando ? "Guardando..." : "Guardar Especialidad"}
            icon="pi pi-save"
            loading={enviando}
            className="h-10 px-5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md border-none"
            onClick={crearNuevaEspecialidad}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default GestionUsuarios;