import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Home,
  Settings,
  User,
  LogOut,
  FileText,
  Medal,
  Clock,
  Inbox,
  Search,
  Star,
  Calendar,
  Building,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ProfileType } from "../../../backend/src/types";

interface UserPanelLayoutProps {
  children: React.ReactNode;
  userType: ProfileType;
}

const UserPanelLayout = ({
  children,
  userType,
}: UserPanelLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, loading, logout } = useAuth();
  const [internalLoading, setInternalLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (!loading) {
      if (user) {
        setUserName(user.email);
        setInternalLoading(false);
      } else {
        setInternalLoading(false);
      }
    }
  }, [user, loading]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = () => {
    return userName
      ? userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  const userTypeLabel: Record<ProfileType, string> = {
    talent: "Jovem Talento",
    hr: "Profissional RH",
    manager: "Gestor",
  };

  const getBasePath = () => {
    switch (userType) {
      case "talent":
        return "/jovem";
      case "hr":
        return "/rh";
      case "manager":
        return "/gestor";
      default:
        return "/";
    }
  };

  const basePath = getBasePath();

  const getMenuItems = () => {
    switch (userType) {
      case "talent":
        return [
          {
            path: "/jovem",
            label: "Painel Principal",
            icon: <Home className="h-4 w-4" />,
          },
          {
            path: "/jovem/perfil",
            label: "Meu Perfil",
            icon: <User className="h-4 w-4" />,
          },
          {
            path: "/jovem/submissoes",
            label: "Meus Envios",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            path: "/jovem/feedbacks",
            label: "Feedbacks",
            icon: <Medal className="h-4 w-4" />,
          },
          {
            path: "/jovem/evolucao",
            label: "Minha Evolução",
            icon: <Clock className="h-4 w-4" />,
          },
          {
            path: "/jovem/convites",
            label: "Convites",
            icon: <Inbox className="h-4 w-4" />,
          },
        ];
      case "hr":
        return [
          {
            path: "/rh",
            label: "Painel Principal",
            icon: <Home className="h-4 w-4" />,
          },
          {
            path: "/rh/projetos-pendentes",
            label: "Projetos para Avaliar",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            path: "/rh/historico",
            label: "Histórico de Avaliações",
            icon: <Clock className="h-4 w-4" />,
          },
          {
            path: "/rh/mensagens",
            label: "Mensagens",
            icon: <MessageSquare className="h-4 w-4" />,
          },
          {
            path: "/rh/perfil",
            label: "Perfil da Empresa",
            icon: <Building className="h-4 w-4" />,
          },
          {
            path: "/rh/relatorios",
            label: "Relatórios",
            icon: <FileText className="h-4 w-4" />,
          },
        ];
      case "manager":
        return [
          {
            path: "/gestor",
            label: "Painel Principal",
            icon: <Home className="h-4 w-4" />,
          },
          {
            path: "/gestor/explorar",
            label: "Explorar Talentos",
            icon: <Search className="h-4 w-4" />,
          },
          {
            path: "/gestor/favoritos",
            label: "Favoritos",
            icon: <Star className="h-4 w-4" />,
          },
          {
            path: "/gestor/entrevistas",
            label: "Entrevistas",
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            path: "/gestor/empresa",
            label: "Minha Empresa",
            icon: <Building className="h-4 w-4" />,
          },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const content = (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="py-4">
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <Avatar className="h-12 w-12">
                {/* <AvatarImage src={user.avatar_url} alt={userName} /> */}
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {internalLoading ? "Carregando..." : userName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userTypeLabel[userType]}
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="py-2">
            <SidebarGroup>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive(item.path)}
                    >
                      <Link to={item.path}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Notificações">
                    <Link to="#">
                      <Bell className="h-4 w-4" />
                      <span>Notificações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Configurações">
                    <Link to="#">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="py-2">
            <SidebarSeparator />
            <div className="p-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <div className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">SimplyInvite</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {(loading || internalLoading) ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-si-accent"></div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

  return (
    <ProtectedRoute allowedProfileType={userType}>{content}</ProtectedRoute>
  );
};

export default UserPanelLayout;
