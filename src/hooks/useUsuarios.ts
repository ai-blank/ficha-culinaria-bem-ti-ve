
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  admin: boolean;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  timestamp: string;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar usuários iniciais
  useEffect(() => {
    const mockUsers: Usuario[] = [
      {
        id: '1',
        name: 'Admin Bem Ti Vê',
        email: 'admin@bemtive.com',
        company: 'Bem Ti Vê',
        phone: '(11) 99999-9999',
        admin: true,
        active: true,
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: '2024-12-14T10:30:00Z'
      },
      {
        id: '2',
        name: 'Chef Maria Silva',
        email: 'maria@bemtive.com',
        company: 'Restaurante da Maria',
        phone: '(11) 88888-8888',
        admin: false,
        active: true,
        emailVerified: true,
        createdAt: '2024-01-02T00:00:00Z',
        lastLogin: '2024-12-13T15:45:00Z'
      },
      {
        id: '3',
        name: 'João Santos',
        email: 'joao@teste.com',
        company: 'Padaria do João',
        phone: '(11) 77777-7777',
        admin: false,
        active: false,
        emailVerified: true,
        createdAt: '2024-02-15T00:00:00Z',
        lastLogin: '2024-12-10T08:20:00Z'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana@confeitaria.com',
        company: 'Confeitaria Doce Vida',
        phone: '(11) 66666-6666',
        admin: false,
        active: true,
        emailVerified: false,
        createdAt: '2024-03-20T00:00:00Z'
      }
    ];

    setUsuarios(mockUsers);

    // Mock audit logs
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        adminId: '1',
        adminName: 'Admin Bem Ti Vê',
        action: 'USER_DEACTIVATED',
        targetUserId: '3',
        targetUserName: 'João Santos',
        details: 'Usuário desativado por inatividade',
        timestamp: '2024-12-14T09:15:00Z'
      },
      {
        id: '2',
        adminId: '1',
        adminName: 'Admin Bem Ti Vê',
        action: 'USER_CREATED',
        targetUserId: '4',
        targetUserName: 'Ana Costa',
        details: 'Novo usuário cadastrado no sistema',
        timestamp: '2024-12-13T14:30:00Z'
      }
    ];

    setAuditLogs(mockAuditLogs);
  }, []);

  const updateUsuario = async (id: string, updates: Partial<Usuario>, adminUser: Usuario): Promise<boolean> => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsuarios(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ));

      // Registrar log de auditoria
      const targetUser = usuarios.find(u => u.id === id);
      if (targetUser) {
        const newLog: AuditLog = {
          id: Date.now().toString(),
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: updates.active === false ? 'USER_DEACTIVATED' : 
                  updates.active === true ? 'USER_ACTIVATED' :
                  updates.admin === true ? 'USER_PROMOTED_ADMIN' :
                  updates.admin === false ? 'USER_DEMOTED_ADMIN' : 'USER_UPDATED',
          targetUserId: id,
          targetUserName: targetUser.name,
          details: `Usuário ${Object.keys(updates).join(', ')} atualizado`,
          timestamp: new Date().toISOString()
        };

        setAuditLogs(prev => [newLog, ...prev]);
      }

      toast({
        title: "Usuário atualizado",
        description: `${targetUser?.name} foi atualizado com sucesso.`,
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: "Não foi possível atualizar o usuário. Tente novamente.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUsuario = async (id: string, adminUser: Usuario): Promise<boolean> => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const targetUser = usuarios.find(u => u.id === id);
      
      setUsuarios(prev => prev.filter(user => user.id !== id));

      // Registrar log de auditoria
      if (targetUser) {
        const newLog: AuditLog = {
          id: Date.now().toString(),
          adminId: adminUser.id,
          adminName: adminUser.name,
          action: 'USER_DELETED',
          targetUserId: id,
          targetUserName: targetUser.name,
          details: 'Usuário removido permanentemente do sistema',
          timestamp: new Date().toISOString()
        };

        setAuditLogs(prev => [newLog, ...prev]);
      }

      toast({
        title: "Usuário removido",
        description: `${targetUser?.name} foi removido permanentemente.`,
      });

      return true;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário. Tente novamente.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    usuarios,
    auditLogs,
    loading,
    updateUsuario,
    deleteUsuario
  };
};
