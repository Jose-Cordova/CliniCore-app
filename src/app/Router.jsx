import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import LoginPage from "../auth/Login.jsx";
import RegisterPage from "../auth/Register.jsx";
import RutaProtegida from "../auth/RutaProtegida.jsx";

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route
        element={
          <RutaProtegida>
            <AppLayout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/citas" element={<div>Citas</div>} />
        <Route path="/pacientes" element={<div>Pacientes</div>} />
        <Route path="/doctores" element={<div>Doctores</div>} />
        <Route path="/especialidades" element={<div>Especialidades</div>} />
        <Route path="/mi-expediente" element={<div>Mi Expediente</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router;