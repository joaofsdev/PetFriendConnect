import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/public/Login";
import Registro from "../pages/public/Registro";
import DashboardCuidador from "../pages/DashboardCuidador";
import DashboardDono from "../pages/DashboardDono";
import MeusPets from "../pages/MeusPets";

const router = createBrowserRouter([
  // Landing page
  { path: "/", element: <Home /> },

  // Páginas de autenticação
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/registro", element: <Registro /> },
    ],
  },

  // Páginas internas — protegidas + com sidebar
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard/cuidador", element: <DashboardCuidador /> },
          { path: "/dashboard/dono", element: <DashboardDono /> },
          { path: "/meus-pets", element: <MeusPets /> },
          // { path: "/encontrar-cuidadores", element: <EncontrarCuidadores /> },
          // { path: "/agendamento",          element: <Agendamento /> },
          // { path: "/minhas-reservas",      element: <MinhasReservas /> },
          // { path: "/minha-agenda",         element: <MinhaAgenda /> },
          // { path: "/meus-servicos",        element: <MeusServicos /> },
          // { path: "/configuracoes",        element: <Configuracoes /> },
          // { path: "/perfil-cuidador/:id",  element: <PerfilCuidador /> },
        ],
      },
    ],
  },
]);

export default router;
