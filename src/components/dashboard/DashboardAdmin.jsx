import { useState, useEffect } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";
import { Link } from "react-router-dom";
import citaService from "../../services/citaService";
import consultaService from "../../services/consultaService";
import pacienteService from "../../services/pacienteService";
import { doctorService } from "../../services/doctorService";
import { useAuth } from "../../auth/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

// Colores de CliniCore
const COLORES = {
    primary: "#2563EB",
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#EF4444",
    teal: "#0D9488",
    indigo: "#4F46E5",
    slate: "#64748B",
};

const ETIQUETAS_ESTADO_CITA = {
    PENDIENTE: "Pendiente",
    RESERVADA: "Reservada",
    ATENDIDA: "Atendida",
    CANCELADA: "Cancelada",
};

const COLORES_ESTADO_CITA = {
    PENDIENTE: COLORES.slate,
    RESERVADA: COLORES.primary,
    ATENDIDA: COLORES.success,
    CANCELADA: COLORES.danger,
};

const DashboardAdmin = () => {
    const { usuario } = useAuth();
    const [citas, setCitas] = useState([]);
    const [consultas, setConsultas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [citasRes, consultasRes, pacientesRes, doctoresRes] = await Promise.allSettled([
                citaService.obtenerTodas(),
                consultaService.obtenerTodas(),
                pacienteService.obtenerTodos(),
                doctorService.listarTodos(),
            ]);

            const extraerArray = (res) => {
                if (res.status !== "fulfilled" || !res.value) return [];
                const val = res.value;
                if (Array.isArray(val)) return val;
                if (Array.isArray(val.data)) return val.data;
                if (Array.isArray(val.content)) return val.content;
                return [];
            };

            setCitas(extraerArray(citasRes));
            setConsultas(extraerArray(consultasRes));
            setPacientes(extraerArray(pacientesRes));
            setDoctores(extraerArray(doctoresRes));
        } catch (error) {
            console.error("Error cargando datos del dashboard admin:", error);
        } finally {
            setCargando(false);
        }
    };

    // Asegurar arrays seguros para evitar errores en llamadas como .filter, .map, .length
    const listaCitas = Array.isArray(citas) ? citas : [];
    const listaConsultas = Array.isArray(consultas) ? consultas : [];
    const listaPacientes = Array.isArray(pacientes) ? pacientes : [];
    const listaDoctores = Array.isArray(doctores) ? doctores : [];

    // Cálculos derivados
    const citasPorEstado = Object.keys(ETIQUETAS_ESTADO_CITA).reduce((acc, estado) => {
        acc[estado] = listaCitas.filter((c) => c && c.estado === estado).length;
        return acc;
    }, {});

    const citasActivas = (citasPorEstado.PENDIENTE ?? 0) + (citasPorEstado.RESERVADA ?? 0);
    const totalConsultas = listaConsultas.length;
    const totalPacientes = listaPacientes.length;

    // Doctor con más consultas
    const consultasPorDoctor = listaDoctores.map((doctor) => {
        if (!doctor) return { doctor: null, count: 0 };
        const count = listaConsultas.filter((c) => c && (c.doctorId === doctor.id || c.doctor?.id === doctor.id)).length;
        return { doctor, count };
    });
    
    const doctorDestacado = [...consultasPorDoctor]
        .filter((item) => item.doctor != null)
        .sort((a, b) => b.count - a.count)[0];

    // Citas por mes (últimos 6 meses)
    const citasPorMes = (() => {
        const meses = [];
        const hoy = new Date();
        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            meses.push({ anio: fecha.getFullYear(), mes: fecha.getMonth() });
        }

        return meses.map(({ anio, mes }) => {
            const total = listaCitas.filter((c) => {
                if (!c) return false;
                const rawFecha = c.fechaHora || c.fecha;
                if (!rawFecha) return false;
                const fecha = new Date(rawFecha);
                if (isNaN(fecha.getTime())) return false;
                return fecha.getFullYear() === anio && fecha.getMonth() === mes;
            }).length;

            const nombreMes = new Date(anio, mes, 1).toLocaleDateString("es-SV", { month: "short" });
            return { etiqueta: `${nombreMes} ${anio}`, total };
        });
    })();

    // Datos para gráfico de dona
    const datosDona = {
        labels: Object.keys(ETIQUETAS_ESTADO_CITA).map((e) => ETIQUETAS_ESTADO_CITA[e]),
        datasets: [
            {
                data: Object.keys(ETIQUETAS_ESTADO_CITA).map((e) => citasPorEstado[e] ?? 0),
                backgroundColor: Object.keys(ETIQUETAS_ESTADO_CITA).map((e) => COLORES_ESTADO_CITA[e]),
                borderWidth: 0,
            },
        ],
    };

    // Datos para gráfico de línea (histograma de citas)
    const datosLinea = {
        labels: citasPorMes.map((m) => m.etiqueta),
        datasets: [
            {
                label: "Citas",
                data: citasPorMes.map((m) => m.total),
                borderColor: COLORES.primary,
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                fill: true,
                tension: 0.35,
            },
        ],
    };

    const opcionesLinea = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    const nombreDoctorDestacado = doctorDestacado?.doctor?.nombre
        ? `${doctorDestacado.doctor.nombre} ${doctorDestacado.doctor.apellido || ""}`
        : "—";

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto font-sans">
            {/* Banner de Bienvenida */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sidebar to-slate-900 text-white shadow-soft-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
                            <i className="pi pi-shield text-xs" />
                            <span>Panel de Administración</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                            Bienvenido, <span className="text-blue-400">{usuario?.nombre || "Administrador"}</span>
                        </h1>

                        <p className="text-slate-400 text-sm max-w-xl">
                            Resumen general y métricas globales de la actividad clínica en CliniCore.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button
                            onClick={cargarDatos}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <i className={`pi pi-refresh ${cargando ? "pi-spin" : ""}`} />
                            Actualizar Datos
                        </button>
                    </div>
                </div>
            </div>

            {/* Tarjetas KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TarjetaKpi
                    titulo="Citas Activas"
                    valor={citasActivas}
                    icono="pi pi-calendar"
                    color="bg-blue-500"
                    cargando={cargando}
                />
                <TarjetaKpi
                    titulo="Consultas Realizadas"
                    valor={totalConsultas}
                    icono="pi pi-check-circle"
                    color="bg-teal-500"
                    cargando={cargando}
                />
                <TarjetaKpi
                    titulo="Pacientes Registrados"
                    valor={totalPacientes}
                    icono="pi pi-users"
                    color="bg-indigo-500"
                    cargando={cargando}
                />
                <TarjetaKpi
                    titulo="Doctor Destacado"
                    valor={nombreDoctorDestacado}
                    icono="pi pi-user-md"
                    color="bg-purple-500"
                    cargando={cargando}
                    esTexto
                />
            </div>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link to="/usuarios" className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <i className="pi pi-user-edit text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">Gestión de Usuarios</p>
                        <p className="text-xs text-slate-500">Administra roles y accesos</p>
                    </div>
                </Link>
                <Link to="/doctores" className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <i className="pi pi-user-md text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">Doctores</p>
                        <p className="text-xs text-slate-500">Especialistas y disponibilidad</p>
                    </div>
                </Link>
                <Link to="/pacientes" className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 hover:shadow-md transition-all flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <i className="pi pi-users text-lg" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 text-sm">Pacientes</p>
                        <p className="text-xs text-slate-500">Expedientes y registros</p>
                    </div>
                </Link>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                    <h5 className="font-bold text-slate-900 mb-4">Citas por Estado</h5>
                    {listaCitas.length === 0 && !cargando ? (
                        <p className="text-sm text-slate-400 text-center py-8">Sin datos todavía</p>
                    ) : (
                        <div className="h-56">
                            <Doughnut
                                data={datosDona}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: "bottom" } },
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                    <h5 className="font-bold text-slate-900 mb-4">Citas - Últimos 6 meses</h5>
                    <div className="h-56">
                        <Line data={datosLinea} options={opcionesLinea} />
                    </div>
                </div>
            </div>

            {/* Doctor destacado detalle */}
            {doctorDestacado && doctorDestacado.doctor && doctorDestacado.count > 0 && (
                <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-5">
                    <h5 className="font-bold text-slate-900 mb-3">Doctor con más consultas</h5>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                            {(doctorDestacado.doctor.nombre || "D").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                                {doctorDestacado.doctor.nombre || "Doctor"} {doctorDestacado.doctor.apellido || ""}
                            </p>
                            <p className="text-sm text-slate-500">
                                {doctorDestacado.doctor.especialidad?.nombre || doctorDestacado.doctor.especialidad || "Sin especialidad"} ·{" "}
                                {doctorDestacado.count} consultas
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TarjetaKpi = ({ titulo, valor, icono, color, cargando, esTexto = false }) => (
    <div className="bg-white shadow-soft rounded-2xl p-5 flex items-center gap-4 border border-slate-100">
        <div className={`${color} text-white rounded-xl p-3 shrink-0`}>
            <i className={`${icono} text-xl`} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{titulo}</p>
            <p className={`text-xl font-bold text-slate-900 ${esTexto ? "truncate" : ""}`}>
                {cargando ? "…" : valor}
            </p>
        </div>
    </div>
);

export default DashboardAdmin;