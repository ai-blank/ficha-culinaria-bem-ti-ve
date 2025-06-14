
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUsuarios, Usuario } from '@/hooks/useUsuarios';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MoreHorizontal, Shield, User, Trash2, UserX, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { usuarios, loading, updateUsuario, deleteUsuario } = useUsuarios();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Usuario>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | 'promote' | 'demote' | 'delete' | null>(null);

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = usuarios
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: keyof Usuario) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType || !currentUser) return;

    let updates: Partial<Usuario> = {};

    switch (actionType) {
      case 'activate':
        updates = { active: true };
        break;
      case 'deactivate':
        updates = { active: false };
        break;
      case 'promote':
        updates = { admin: true };
        break;
      case 'demote':
        updates = { admin: false };
        break;
      case 'delete':
        await deleteUsuario(selectedUser.id, currentUser);
        setSelectedUser(null);
        setActionType(null);
        return;
    }

    await updateUsuario(selectedUser.id, updates, currentUser);
    setSelectedUser(null);
    setActionType(null);
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'activate': return 'Ativar Usuário';
      case 'deactivate': return 'Desativar Usuário';
      case 'promote': return 'Promover a Administrador';
      case 'demote': return 'Remover Privilégios de Admin';
      case 'delete': return 'Excluir Usuário';
      default: return '';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'activate': return `Tem certeza que deseja ativar o usuário ${selectedUser?.name}?`;
      case 'deactivate': return `Tem certeza que deseja desativar o usuário ${selectedUser?.name}? O usuário não conseguirá mais acessar o sistema.`;
      case 'promote': return `Tem certeza que deseja promover ${selectedUser?.name} a administrador? Este usuário terá acesso total ao sistema.`;
      case 'demote': return `Tem certeza que deseja remover os privilégios de administrador de ${selectedUser?.name}?`;
      case 'delete': return `Tem certeza que deseja excluir permanentemente o usuário ${selectedUser?.name}? Esta ação não pode ser desfeita.`;
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Administre usuários e suas permissões</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Usuários ({filteredAndSortedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Nome {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 hidden sm:table-cell"
                    onClick={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Empresa</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell">Último Login</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{usuario.name}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">
                          {usuario.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{usuario.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{usuario.company || '-'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={usuario.active ? "default" : "secondary"}>
                        {usuario.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={usuario.admin ? "destructive" : "outline"}>
                        {usuario.admin ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          'Usuário'
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {usuario.lastLogin ? 
                        format(new Date(usuario.lastLogin), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {usuario.active ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(usuario);
                                setActionType('deactivate');
                              }}
                              className="text-orange-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(usuario);
                                setActionType('activate');
                              }}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {usuario.admin ? (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(usuario);
                                setActionType('demote');
                              }}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Remover Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(usuario);
                                setActionType('promote');
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promover Admin
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(usuario);
                              setActionType('delete');
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription>
              {getActionDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={loading}>
              {loading ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsersPage;
