
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import ProfileForm from '@/components/profile/ProfileForm';
import { IngredientesPage } from '@/components/ingredientes/IngredientesPage';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import AdminUsersPage from '@/components/admin/AdminUsersPage';
import AdminSystemPage from '@/components/admin/AdminSystemPage';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { 
  Home, 
  FileText, 
  Package, 
  Users, 
  ChefHat,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'fichas', label: 'Fichas Técnicas', icon: FileText },
    { id: 'ingredientes', label: 'Ingredientes', icon: Package },
  ];

  const adminItems = [
    { id: 'admin-users', label: 'Usuários', icon: Users },
    { id: 'admin-system', label: 'Sistema', icon: Database },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setShowProfile(false);
  };

  const renderContent = () => {
    if (showProfile) {
      return <ProfileForm />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleTabChange} />;
      case 'fichas':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Fichas Técnicas</h2>
            <p className="text-muted-foreground">Módulo de fichas técnicas em desenvolvimento...</p>
          </div>
        );
      case 'ingredientes':
        return <IngredientesPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case 'admin-system':
        return <AdminSystemPage />;
      default:
        return <DashboardOverview onNavigate={handleTabChange} />;
    }
  };

  const getPageTitle = () => {
    if (showProfile) return 'Meu Perfil';
    
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'fichas': return 'Fichas Técnicas';
      case 'ingredientes': return 'Ingredientes';
      case 'admin-users': return 'Gerenciar Usuários';
      case 'admin-system': return 'Sistema';
      default: return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2 px-2 py-4">
                <ChefHat className="h-5 w-5 text-primary" />
                <span className="font-semibold">Gestão Culinária</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => handleTabChange(item.id)}
                        isActive={activeTab === item.id}
                        className="w-full justify-start gap-3"
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  
                  {user?.admin && (
                    <>
                      <SidebarGroupLabel className="pt-4 pb-2 px-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          Administração
                        </span>
                      </SidebarGroupLabel>
                      {adminItems.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => handleTabChange(item.id)}
                            isActive={activeTab === item.id}
                            className="w-full justify-start gap-3"
                          >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex-1">
          <Header 
            onProfileClick={() => {
              setShowProfile(true);
              setActiveTab('');
            }}
            onSettingsClick={user?.admin ? () => {
              setActiveTab('admin-users');
              setShowProfile(false);
            } : undefined}
          />
          
          <main className="flex-1 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <SidebarTrigger className="md:hidden" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{getPageTitle()}</h1>
                {!showProfile && activeTab !== 'ingredientes' && (
                  <p className="text-muted-foreground mt-2">
                    Bem-vindo ao sistema de gestão culinária Bem Ti Vê
                  </p>
                )}
              </div>
            </div>
            
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
