
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, TrendingUp, Users, ChefHat } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigate?: (tab: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  // Dados simulados para demonstração
  const stats = {
    totalFichas: 24,
    totalIngredientes: 156,
    economiaMedia: 15.8,
    usuarios: 8
  };

  const recentActivity = [
    { id: 1, action: 'Ficha criada', item: 'Bolo de Chocolate Premium', time: '2 horas atrás' },
    { id: 2, action: 'Ingrediente atualizado', item: 'Farinha de Trigo Especial', time: '4 horas atrás' },
    { id: 3, action: 'Cálculo realizado', item: 'Torta de Morango', time: '6 horas atrás' },
    { id: 4, action: 'Ficha clonada', item: 'Pão Francês Artesanal', time: '1 dia atrás' },
  ];

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fichas Técnicas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalFichas}</div>
            <p className="text-xs text-muted-foreground">
              +3 novas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredientes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalIngredientes}</div>
            <p className="text-xs text-muted-foreground">
              +12 novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bem-ti-ve-green">{stats.economiaMedia}%</div>
            <p className="text-xs text-muted-foreground">
              vs preços de mercado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bem-ti-ve-orange">{stats.usuarios}</div>
            <p className="text-xs text-muted-foreground">
              +2 novos usuários
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="hover-scale cursor-pointer bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20"
          onClick={() => onNavigate?.('fichas')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Nova Ficha Técnica</h3>
                <p className="text-sm text-muted-foreground">Criar receita e calcular custos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover-scale cursor-pointer bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20"
          onClick={() => onNavigate?.('ingredientes')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Novo Ingrediente</h3>
                <p className="text-sm text-muted-foreground">Cadastrar ingrediente no sistema</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Atividade recente */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm">{activity.item}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
