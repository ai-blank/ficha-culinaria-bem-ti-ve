
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Search, Shield, Activity, Database, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminSystemPage: React.FC = () => {
  const { usuarios, auditLogs } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar logs de auditoria
  const filteredAuditLogs = auditLogs.filter(log => 
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.targetUserName && log.targetUserName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas do sistema
  const systemStats = {
    totalUsers: usuarios.length,
    activeUsers: usuarios.filter(u => u.active).length,
    adminUsers: usuarios.filter(u => u.admin).length,
    recentActions: auditLogs.length
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_CREATED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Criado</Badge>;
      case 'USER_ACTIVATED':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Ativado</Badge>;
      case 'USER_DEACTIVATED':
        return <Badge variant="secondary">Desativado</Badge>;
      case 'USER_PROMOTED_ADMIN':
        return <Badge variant="destructive">Promovido</Badge>;
      case 'USER_DEMOTED_ADMIN':
        return <Badge variant="outline">Rebaixado</Badge>;
      case 'USER_DELETED':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Excluído</Badge>;
      case 'USER_UPDATED':
        return <Badge variant="outline">Atualizado</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Sistema</h1>
        <p className="text-muted-foreground">Monitore atividades e estatísticas do sistema</p>
      </div>

      {/* Estatísticas do sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Todos os usuários cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bem-ti-ve-green">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com acesso ao sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bem-ti-ve-orange">{systemStats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com privilégios admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Registradas</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{systemStats.recentActions}</div>
            <p className="text-xs text-muted-foreground">
              Total de ações auditadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Log de Auditoria */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Log de Auditoria
            </CardTitle>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar ações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAuditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma ação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead className="hidden md:table-cell">Usuário Alvo</TableHead>
                    <TableHead className="hidden lg:table-cell">Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-bem-ti-ve-orange" />
                          {log.adminName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.targetUserName || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-xs truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemPage;
