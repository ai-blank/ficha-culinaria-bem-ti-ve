
import React, { useState } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Users, UserCheck, Shield, Eye, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUsersPage: React.FC = () => {
  const { usuarios, auditLogs, isLoading, updateUsuario, getStats } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const stats = getStats();

  const filteredUsers = usuarios
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: 'name' | 'email' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    await updateUsuario(userId, { active: !currentStatus });
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    await updateUsuario(userId, { admin: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Administre usuários e suas permissões</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos (Este Mês)</CardTitle>
            <Calendar className="h-4 w-4 text-bem-ti-ve-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-bem-ti-ve-orange">{stats.newUsersThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('email')}
                >
                  Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('createdAt')}
                >
                  Criado em {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.active}
                        onCheckedChange={() => handleToggleActive(user.id, user.active)}
                      />
                      <Badge variant={user.active ? 'default' : 'secondary'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.admin}
                        onCheckedChange={() => handleToggleAdmin(user.id, user.admin)}
                      />
                      <Badge variant={user.admin ? 'destructive' : 'outline'}>
                        {user.admin ? 'Admin' : 'Usuário'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Detalhes do Usuário</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Nome:</label>
                              <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email:</label>
                              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Empresa:</label>
                              <p className="text-sm text-muted-foreground">{selectedUser.company || 'Não informado'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Telefone:</label>
                              <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Não informado'}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status:</label>
                              <Badge variant={selectedUser.active ? 'default' : 'secondary'} className="ml-2">
                                {selectedUser.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tipo:</label>
                              <Badge variant={selectedUser.admin ? 'destructive' : 'outline'} className="ml-2">
                                {selectedUser.admin ? 'Administrador' : 'Usuário'}
                              </Badge>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Criado em:</label>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(selectedUser.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log de auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg border">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{log.adminName}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>{log.action.replace('_', ' ')}</span>
                    {log.targetUserName && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">{log.targetUserName}</span>
                      </>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
