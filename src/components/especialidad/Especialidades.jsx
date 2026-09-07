import { useState, useEffect, useRef } from "react";
import {
    Button,
    InputText,
    Dialog,
    Toast,
    DataTable,
    Column,
    ConfirmDialog,
    IconField,
    InputIcon,
} from "../../config/primeReact.jsx";
import { confirmDialog } from "primereact/confirmdialog";
import {
    listarEspecialidades,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad,
} from "../../services/especialidadesService";

const Especialidades = () => {
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState("");

    const [dialogVisible, setDialogVisible] = useState(false);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
    const [nombre, setNombre] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [errorNombre, setErrorNombre] = useState("");

    const toast = useRef(null);

    useEffect(() => {
        cargarEspecialidades();
    }, []);

    const cargarEspecialidades = async () => {
        try {
            setLoading(true);
            const data = await listarEspecialidades();
            setEspecialidades(data);
        } catch (error) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudieron cargar las especialidades.",
                life: 3500,
            });
        } finally {
            setLoading(false);
        }
    };

    const abrirNuevo = () => {
        setEspecialidadSeleccionada(null);
        setNombre("");
        setErrorNombre("");
        setDialogVisible(true);
    };

    const abrirEditar = (especialidad) => {
        setEspecialidadSeleccionada(especialidad);
        setNombre(especialidad.nombre);
        setErrorNombre("");
        setDialogVisible(true);
    };

    const cerrarDialog = () => {
        setDialogVisible(false);
        setEspecialidadSeleccionada(null);
        setNombre("");
        setErrorNombre("");
    };

    const guardarEspecialidad = async () => {
        if (!nombre.trim()) {
            setErrorNombre("El nombre de la especialidad es obligatorio.");
            return;
        }

        try {
            setGuardando(true);
            if (especialidadSeleccionada) {
                await actualizarEspecialidad(especialidadSeleccionada.id, nombre.trim());
                toast.current.show({
                    severity: "success",
                    summary: "Especialidad actualizada",
                    detail: "Los cambios se guardaron correctamente.",
                    life: 3000,
                });
            } else {
                await crearEspecialidad(nombre.trim());
                toast.current.show({
                    severity: "success",
                    summary: "Especialidad registrada",
                    detail: "La especialidad se creó correctamente.",
                    life: 3000,
                });
            }
            cerrarDialog();
            cargarEspecialidades();
        } catch (error) {
            const mensaje =
                error?.response?.data?.message || "Ocurrió un error al guardar la especialidad.";
            toast.current.show({
                severity: "error",
                summary: "No se pudo guardar",
                detail: mensaje,
                life: 4000,
            });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = (especialidad) => {
        confirmDialog({
            message: `¿Deseas eliminar la especialidad "${especialidad.nombre}"?`,
            header: "Confirmar eliminación",
            acceptLabel: "Sí, eliminar",
            rejectLabel: "Cancelar",
            className: "!rounded-2xl overflow-hidden !border-none",
            acceptClassName:
                "!bg-red-500 hover:!bg-red-600 !border-none !text-white !px-5 !py-2.5 !text-sm !font-semibold",
            rejectClassName: 
            "p-button-text !px-5 !py-2.5 !text-sm",
            pt: {
            content: { className: "!bg-white" },
            footer: { className: "!bg-white !pt-0 !pb-6 !px-6" }
        },
            accept: () => eliminarEspecialidadHandler(especialidad.id),
        });
    };

    const eliminarEspecialidadHandler = async (id) => {
        try {
            await eliminarEspecialidad(id);
            toast.current.show({
                severity: "success",
                summary: "Especialidad eliminada",
                detail: "La especialidad se eliminó correctamente.",
                life: 3000,
            });
            cargarEspecialidades();
        } catch (error) {
            const mensaje =
                error?.response?.data?.message ||
                "Ocurrió un error al eliminar la especialidad.";
            toast.current.show({
                severity: "error",
                summary: "No se pudo eliminar",
                detail: mensaje,
                life: 4500,
            });
        }
    };

    const accionesTemplate = (rowData) => (
        <div className="flex gap-2">
            <button
                onClick={() => abrirEditar(rowData)}
                className="px-3 py-1 text-xs font-medium rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
            >
                <i className="pi pi-pencil text-xs"></i>
                Editar
            </button>
            <button
                onClick={() => confirmarEliminacion(rowData)}
                className="px-3 py-1 text-xs font-medium rounded-full border border-red-400 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
            >
                <i className="pi pi-trash text-xs"></i>
                Eliminar
            </button>
        </div>
    );

    return (
        <div className="p-6 flex flex-col gap-5">
            <Toast ref={toast} />
            <ConfirmDialog className="!rounded-2xl overflow-hidden" style={{ width: "450px" }} />

            {/* Card de encabezado */}
            <div className="bg-surface-card rounded-2xl shadow-soft border border-surface-border p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                            <i className="pi pi-list text-primary text-sm"></i>
                        </span>
                        <span className="text-xs font-semibold tracking-wide text-primary">
                            Panel administrativo
                        </span>
                    </div>
                    <h1 className="font-display text-2xl font-bold text-slate-800">
                        Gestión de{" "}
                        <span className="bg-gradient-to-r from-primary to-brand-indigo bg-clip-text text-transparent">
                            Especialidades
                        </span>
                    </h1>
                    <p className="text-sm text-surface-muted mt-1">
                        Administra el catálogo de especialidades médicas disponibles en el sistema.
                    </p>
                </div>

                <Button
                    label="Nueva Especialidad"
                    icon="pi pi-plus"
                    onClick={abrirNuevo}
                    className="!bg-gradient-to-r !from-primary !to-brand-indigo !border-none !rounded-full !px-5 !py-2.5 !text-sm !font-semibold !text-white !shadow-soft"
                />
            </div>

            {/* Card de tabla */}
            <div className="bg-surface-card rounded-2xl shadow-soft border border-surface-border p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <IconField iconPosition="left" className="w-full max-w-md">
                        <InputText
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="    Buscar por nombre..."
                            className="w-full !bg-slate-100 !border-slate-300 !text-slate-700 placeholder:text-slate-400 !py-3 !text-sm"
                        />
                    </IconField>

                    <span className="text-xs font-medium text-surface-muted border border-surface-border rounded-full px-3 py-1">
                        Total: {especialidades.length} especialidades
                    </span>
                </div>

                <DataTable
                    value={especialidades}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    globalFilter={globalFilter}
                    globalFilterFields={["nombre"]}
                    emptyMessage="No hay especialidades registradas."
                    stripedRows
                >
                    <Column field="nombre" header="Nombre" sortable />
                    <Column
                        header="Acciones"
                        body={accionesTemplate}
                        style={{ width: "160px" }}
                    />
                </DataTable>
            </div>

           <Dialog
    header={especialidadSeleccionada ? "Editar Especialidad" : "Nueva Especialidad"}
    visible={dialogVisible}
    style={{ width: "480px" }}
    className="!rounded-2xl overflow-hidden !border-none"
    // Forzamos el fondo blanco en el cuerpo del diálogo
    contentClassName="!bg-white" 
    footerClassName="!bg-white !pt-0 !pb-6 !px-6" 
    onHide={cerrarDialog}
    footer={
        // Forzamos el fondo blanco también en el área del footer
        <div className="flex justify-end gap-2 pt-2 bg-white">
            <Button
                label="Cancelar"
                className="p-button-text !px-5 !py-2.5 !text-sm"
                onClick={cerrarDialog}
                disabled={guardando}
            />
            <Button
                label="Guardar"
                onClick={guardarEspecialidad}
                loading={guardando}
                className="!bg-primary hover:!bg-primary-hover !border-none !text-white !px-5 !py-2.5 !text-sm !font-semibold"
            />
        </div>
    }
>
                <div className="flex flex-col gap-2 pt-2 pb-2">
                    <label htmlFor="nombre" className="text-sm font-medium text-surface-muted">
                        Nombre de la especialidad
                    </label>
                    <InputText
                        id="nombre"
                        value={nombre}
                        onChange={(e) => {
                            setNombre(e.target.value);
                            if (errorNombre) setErrorNombre("");
                        }}
                        className={errorNombre ? "p-invalid" : ""}
                        autoFocus
                    />
                    {errorNombre && (
                        <small className="text-red-500">{errorNombre}</small>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default Especialidades;