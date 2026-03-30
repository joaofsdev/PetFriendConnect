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
import EncontrarCuidadores from "../pages/EncontrarCuidadores";
import Agendamento from "../pages/Agendamento";
import MinhasReservas from "../pages/MinhasReservas";
import Configuracoes from "../pages/Configuracoes";
import MinhaAgenda from "../pages/MinhaAgenda";
import MeusServicos from "../pages/MeusServicos";
import PerfilCuidador from "../pages/PerfilCuidador";
import DashboardAdmin from "../pages/admin/DashboardAdmin";
import AdminUsuarios from "../pages/admin/AdminUsuarios";
import AdminDenuncias from "../pages/admin/AdminDenuncias";
import AdminLogs from "../pages/admin/AdminLogs";
import AdminConfiguracoes from "../pages/admin/AdminConfiguracoes";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/registro", element: <Registro /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard/cuidador", element: <DashboardCuidador /> },
          { path: "/dashboard/dono", element: <DashboardDono /> },
          { path: "/meus-pets", element: <MeusPets /> },
          { path: "/encontrar-cuidadores", element: <EncontrarCuidadores /> },
          { path: "/agendamento", element: <Agendamento /> },
          { path: "/minhas-reservas", element: <MinhasReservas /> },
          { path: "/configuracoes", element: <Configuracoes /> },
          { path: "/minha-agenda", element: <MinhaAgenda /> },
          { path: "/meus-servicos", element: <MeusServicos /> },
          { path: "/perfil-cuidador/:id", element: <PerfilCuidador /> },
          { path: "/admin", element: <DashboardAdmin /> },
          { path: "/admin/usuarios", element: <AdminUsuarios /> },
          { path: "/admin/denuncias", element: <AdminDenuncias /> },
          { path: "/admin/logs", element: <AdminLogs /> },
          { path: "/admin/configuracoes", element: <AdminConfiguracoes /> },
        ],
      },
    ],
  },
]);

export default router;
