
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIngredientes } from '@/hooks/useIngredientes';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Package,
  ChefHat,
  Activity,
  TrendingUp,
  FileText,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';

interface DashboardOverviewProps {
  onNavigate: (tab: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { ingredientes } = useIngredientes();
  const { fichasTecnicas } = useFichasTecnicas();

  const estatisticas = {
    totalIngredientes: ingredientes.length,
    ingredientesAtivos: ingredientes.filter(i => i.ativo).length,
    totalFichas: fichasTecnicas.length,
    fichasAtivas: fichasTecnicas.filter(f => f.ativo).length,
    valorMedioFichas: fichasTecnicas.length > 0 
      ? fichasTecnicas.reduce((acc, f) => acc + (f.custo_total || 0), 0) / fichasTecnicas.length 
      : 0,
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Olá, {user?.name || 'Usuário'}! 👋
              </h2>
              <p className="text-muted-foreground">
                Bem-vindo ao seu painel de gestão culinária
              </p>
            </div>
            <ChefHat className="h-16 w-16 text-primary opacity-20" />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => onNavigate('ingredientes')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingredientes</p>
                <p className="text-2xl font-bold">{estatisticas.totalIngredientes}</p>
                <p className="text-xs text-muted-foreground">
                  {estatisticas.ingredientesAtivos} ativos
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => onNavigate('fichas')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fichas Técnicas</p>
                <p className="text-2xl font-bold">{estatisticas.totalFichas}</p>
                <p className="text-xs text-muted-foreground">
                  {estatisticas.fichasAtivas} ativas
                </p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Médio</p>
                <p className="text-2xl font-bold">{formatarMoeda(estatisticas.valorMedioFichas)}</p>
                <p className="text-xs text-muted-foreground">por ficha técnica</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistema</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
                <p className="text-xs text-muted-foreground">funcionando</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => onNavigate('ingredientes')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Package className="h-6 w-6" />
              Gerenciar Ingredientes
            </Button>
            
            <Button 
              onClick={() => onNavigate('fichas')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <Calculator className="h-6 w-6" />
              Criar Ficha Técnica
            </Button>
            
            <Button 
              onClick={() => onNavigate('fichas')} 
              className="h-20 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-6 w-6" />
              Ver Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Fichas Técnicas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {fichasTecnicas.length === 0 ? (
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma ficha técnica criada ainda
              </p>
              <Button onClick={() => onNavigate('fichas')}>
                Criar primeira ficha técnica
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fichasTecnicas
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((ficha) => (
                  <div key={ficha.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{ficha.nome_receita}</p>
                      <p className="text-sm text-muted-foreground">
                        Rendimento: {ficha.rendimento} {ficha.unidade_rendimento}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatarMoeda(ficha.custo_total || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        Atualizada em {new Date(ficha.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              
              {fichasTecnicas.length > 5 && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onNavigate('fichas')}
                >
                  Ver todas as fichas técnicas
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
