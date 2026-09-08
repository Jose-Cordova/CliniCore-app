import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import LoginPage from "../auth/Login.jsx";
import RegisterPage from "../auth/Register.jsx";
import RutaProtegida from "../auth/RutaProtegida.jsx";
import CambiarContrasenia from "../auth/CambiarContrasenia.jsx";
import GestionUsuarios from "../components/usuarios/GestionUsuarios.jsx";
import DisponibilidadDoctor from "../components/disponibilidad/DisponibilidadDoctor.jsx";
import DashboardDoctor from "../components/dashboard/DashboardDoctor.jsx";
import DashboardPaciente from "../components/dashboard/DashboardPaciente.jsx";
import PerfilPaciente from "../components/pacientes/PerfilPaciente.jsx";
import MisConsultasPaciente from "../components/consultas/MisConsultasPaciente.jsx";
import HorarioBaseDoctor from "../components/horario/HorarioBaseDoctor.jsx";
import CitasDoctor from "../components/citas/CitasDoctor.jsx";
import PacientesDoctor from "../components/pacientes/PacientesDoctor.jsx"
import DashboardPersonal from "../components/dashboard/DashboardPersonal.jsx";
import TirajePaciente from "../components/citas/TriajePaciente.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import CitasPaciente from "../components/citas/CitasPaciente.jsx";
import MisCitas from "../components/citas/MisCitas.jsx";
import DashboardAdmin from "../components/dashboard/DashboardAdmin.jsx";
import Especialidades from "../components/especialidad/Especialidades.jsx";
import CatalogoDoctores from "../components/usuarios/CatalogoDoctores.jsx";
import Reportes from "../components/reports/Reportes.jsx";

const Inicio = () => {
  const { usuario } = useAuth();
  switch (usuario?.rol) {
    case "DOCTOR":
      return <DashboardDoctor />;
    case "PACIENTE":
      return <DashboardPaciente />;
    case "PERSONAL":
      return <DashboardPersonal />;
    case "ADMIN":
      return <DashboardAdmin />; 
    default:
      return <div>Inicio</div>;
  }
};

const Router = () => (
  <BrowserRouter>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Ruta especial para cambio de contraseña: solo requiere autenticación, sin layout */}
      <Route
        path="/cambiar-contrasenia"
        element={
          <RutaProtegida>
            <CambiarContrasenia />
          </RutaProtegida>
        }
      />

      {/* Rutas protegidas con layout principal */}
      <Route
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Inicio />} />
        <Route
          path="/citas"
          element={
            <RutaProtegida rolesPermitidos={["DOCTOR"]}>
              <CitasDoctor />
            </RutaProtegida>
          }
        />
        <Route path="/pacientes" element={<PacientesDoctor />} />
        <Route
          path="/doctores"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <CatalogoDoctores />
            </RutaProtegida>
          }
        />
        <Route path="/mi-expediente" element={<PerfilPaciente />} />
        <Route
          path="/mis-consultas"
          element={
            <RutaProtegida rolesPermitidos={["PACIENTE"]}>
              <MisConsultasPaciente />
            </RutaProtegida>
          }
        />

          <Route
  path="/especialidades"
  element={
    <RutaProtegida rolesPermitidos={["ADMIN"]}>
      <Especialidades />
    </RutaProtegida>
  }
/>
        <Route
          path="/triaje"
          element={
            <RutaProtegida rolesPermitidos={["PERSONAL", "ADMIN"]}>
              <TirajePaciente />
            </RutaProtegida>
          }
        />

        {/* Ruta de administración de usuarios solo para ADMIN */}
        <Route
          path="/usuarios"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <GestionUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/reports"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN"]}>
              <Reportes />
            </RutaProtegida>
          }
        />
        <Route path="/disponibilidad" element={<DisponibilidadDoctor />} />
        <Route path="/mi-horario" element={<HorarioBaseDoctor />} />

          <Route
    path="/citas/agendar"
    element={
      <RutaProtegida rolesPermitidos={["PACIENTE"]}>
        <CitasPaciente />
      </RutaProtegida>
    }
  />
  <Route
    path="/citas/mis-citas"
    element={
      <RutaProtegida rolesPermitidos={["PACIENTE"]}>
        <MisCitas />
      </RutaProtegida>
    }
  />
      </Route>

      {/*Rutas protegida para el PACIENTE*/ }
    

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router