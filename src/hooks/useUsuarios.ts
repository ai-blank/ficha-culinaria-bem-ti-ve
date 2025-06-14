
import { useState, useEffect } from 'react';
import { User } from '@/contexts/AuthContext';

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  details: string;
  timestamp: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular dados iniciais
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Admin Bem Ti Vê',
        email: 'admin@bemtive.com',
        company: 'Bem Ti Vê',
        phone: '(11) 99999-9999',
        admin: true,
        active: true,
        emailVerified: true,
        createdAt: '2024-01-01T00:00:00Z'
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
        createdAt: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: 'João Santos',
        email: 'joao@restaurante.com',
        company: 'Restaurante do João',
        phone: '(11) 77777-7777',
        admin: false,
        active: true,
        emailVerified: true,
        createdAt: '2024-02-15T00:00:00Z'
      },
      {
        id: '4',
        name: 'Ana Costa',
        email: 'ana@padaria.com',
        company: 'Padaria da Ana',
        phone: '(11) 66666-6666',
        admin: false,
        active: false,
        emailVerified: true,
        createdAt: '2024-03-10T00:00:00Z'
      }
    ];

    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        adminId: '1',
        adminName: 'Admin Bem Ti Vê',
        action: 'user_deactivated',
        targetUserId: '4',
        targetUserName: 'Ana Costa',
        details: 'Usuário desativado por inatividade prolongada',
        timestamp: '2024-12-14T10:30:00Z'
      },
      {
        id: '2',
        adminId: '1',
        adminName: 'Admin Bem Ti Vê',
        action: 'user_created',
        targetUserId: '3',
        targetUserName: 'João Santos',
        details: 'Novo usuário criado no sistema',
        timestamp: '2024-02-15T09:15:00Z'
      }
    ];

    setUsuarios(mockUsers);
    setAuditLogs(mockAuditLogs);
    setIsLoading(false);
  }, []);

  const addAuditLog = (action: string, targetUserId?: string, targetUserName?: string, details?: string) => {
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    const newLog: AuditLog = {
      id: Date.now().toString(),
      adminId: currentUser.id,
      adminName: currentUser.name,
      action,
      targetUserId,
      targetUserName,
      details: details || '',
      timestamp: new Date().toISOString()
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateUsuario = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      setUsuarios(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      const targetUser = usuarios.find(u => u.id === userId);
      if (targetUser) {
        if ('active' in updates) {
          addAuditLog(
            updates.active ? 'user_activated' : 'user_deactivated',
            userId,
            targetUser.name,
            `Usuário ${updates.active ? 'ativado' : 'desativado'}`
          );
        }
        if ('admin' in updates) {
          addAuditLog(
            updates.admin ? 'user_promoted' : 'user_demoted',
            userId,
            targetUser.name,
            `Usuário ${updates.admin ? 'promovido a' : 'removido de'} administrador`
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = (): UserStats => {
    const totalUsers = usuarios.length;
    const activeUsers = usuarios.filter(u => u.active).length;
    const adminUsers = usuarios.filter(u => u.admin).length;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const newUsersThisMonth = usuarios.filter(u => 
      new Date(u.createdAt) >= thisMonth
    ).length;

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      newUsersThisMonth
    };
  };

  return {
    usuarios,
    auditLogs,
    isLoading,
    updateUsuario,
    getStats
  };
};
