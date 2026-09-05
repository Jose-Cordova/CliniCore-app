import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import LoginPage from "../auth/Login.jsx";
import RegisterPage from "../auth/Register.jsx";
import RutaProtegida from "../auth/RutaProtegida.jsx";
import CambiarContrasenia from "../auth/CambiarContrasenia.jsx";
import GestionUsuarios from "../components/usuarios/GestionUsuarios.jsx"; // ajusta según tu estructura
import DisponibilidadDoctor from "../components/disponibilidad/DisponibilidadDoctor.jsx";
import DashboardDoctor from "../components/dashboard/DashboardDoctor.jsx";
import DashboardPaciente from "../components/dashboard/DashboardPaciente.jsx";
import PerfilPaciente from "../components/pacientes/PerfilPaciente.jsx";
import MisConsultasPaciente from "../components/consultas/MisConsultasPaciente.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const Inicio = () => {
  const { usuario } = useAuth();
  if (usuario?.rol === "DOCTOR") {
    return <DashboardDoctor />;
  }
  if (usuario?.rol === "PACIENTE") {
    return <DashboardPaciente />;
  }
  return <div>Inicio</div>;
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
        <Route path="/citas" element={<div>Citas</div>} />
        <Route
          path="/pacientes"
          element={
            <RutaProtegida rolesPermitidos={["ADMIN", "DOCTOR", "RECEPCIONISTA", "PERSONAL"]}>
              <div>Pacientes</div>
            </RutaProtegida>
          }
        />
        <Route path="/doctores" element={<div>Doctores</div>} />
        <Route path="/especialidades" element={<div>Especialidades</div>} />
        <Route path="/mi-expediente" element={<PerfilPaciente />} />
        <Route
          path="/mis-consultas"
          element={
            <RutaProtegida rolesPermitidos={["PACIENTE"]}>
              <MisConsultasPaciente />
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
        <Route path="/disponibilidad" element={<DisponibilidadDoctor />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router;