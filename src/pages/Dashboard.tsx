import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ProfileForm from '@/components/profile/ProfileForm';
import { IngredientesPage } from '@/components/ingredientes/IngredientesPage';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);

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
      case 'calculadora':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Calculadora</h2>
            <p className="text-muted-foreground">Calculadora de custos em desenvolvimento...</p>
          </div>
        );
      case 'admin-users':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Gerenciar Usuários</h2>
            <p className="text-muted-foreground">Painel administrativo em desenvolvimento...</p>
          </div>
        );
      case 'admin-system':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Sistema</h2>
            <p className="text-muted-foreground">Configurações do sistema em desenvolvimento...</p>
          </div>
        );
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
      case 'calculadora': return 'Calculadora';
      case 'admin-users': return 'Gerenciar Usuários';
      case 'admin-system': return 'Sistema';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          handleTabChange(tab);
        }}
        isAdmin={user?.admin || false}
      />
      
      <div className="flex-1 flex flex-col">
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
        
        <main className="flex-1 p-6">
          {!showProfile && activeTab !== 'ingredientes' && (
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">{getPageTitle()}</h1>
              <p className="text-muted-foreground mt-2">
                Bem-vindo ao sistema de gestão culinária Bem Ti Vê
              </p>
            </div>
          )}
          
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
