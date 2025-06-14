
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Server, 
  Activity, 
  HardDrive, 
  Users, 
  Package,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const AdminSystemPage: React.FC = () => {
  // Dados simulados do sistema
  const systemInfo = {
    version: '1.0.0',
    environment: 'Production',
    uptime: '15 dias, 8 horas',
    lastBackup: '2024-12-14 02:00:00',
    dbSize: '2.3 GB',
    activeConnections: 12,
    totalUsers: 8,
    totalIngredients: 156,
    totalRecipes: 24
  };

  const systemHealth = {
    database: 'healthy',
    storage: 'healthy',
    api: 'healthy',
    backup: 'warning'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema</h1>
          <p className="text-muted-foreground">Monitoramento e configurações do sistema</p>
        </div>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Versão</label>
              <p className="text-lg font-semibold">{systemInfo.version}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ambiente</label>
              <p className="text-lg font-semibold">{systemInfo.environment}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tempo Online</label>
              <p className="text-lg font-semibold">{systemInfo.uptime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status dos Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Database className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Banco de Dados</span>
                  {getStatusIcon(systemHealth.database)}
                </div>
                <Badge variant={getStatusColor(systemHealth.database)} className="mt-1">
                  Operacional
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <HardDrive className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Armazenamento</span>
                  {getStatusIcon(systemHealth.storage)}
                </div>
                <Badge variant={getStatusColor(systemHealth.storage)} className="mt-1">
                  Operacional
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Server className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">API</span>
                  {getStatusIcon(systemHealth.api)}
                </div>
                <Badge variant={getStatusColor(systemHealth.api)} className="mt-1">
                  Operacional
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Backup</span>
                  {getStatusIcon(systemHealth.backup)}
                </div>
                <Badge variant={getStatusColor(systemHealth.backup)} className="mt-1">
                  Atenção
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {systemInfo.activeConnections} conexões ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingredientes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.totalIngredients}</div>
            <p className="text-xs text-muted-foreground">
              Cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fichas Técnicas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo.totalRecipes}</div>
            <p className="text-xs text-muted-foreground">
              Receitas criadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Backup e Manutenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup e Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Último Backup</h4>
                <p className="text-sm text-muted-foreground">{systemInfo.lastBackup}</p>
              </div>
              <Button variant="outline">
                Executar Backup
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Tamanho do Banco</h4>
                <p className="text-sm text-muted-foreground">{systemInfo.dbSize}</p>
              </div>
              <Button variant="outline">
                Otimizar
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Limpeza de Cache</h4>
                <p className="text-sm text-muted-foreground">Limpar arquivos temporários</p>
              </div>
              <Button variant="outline">
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Configurações do Sistema</h3>
            <p className="text-muted-foreground mb-4">
              Área restrita para configurações avançadas do sistema
            </p>
            <Button variant="outline" disabled>
              Em desenvolvimento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemPage;
