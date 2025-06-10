
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Package, 
  Users, 
  ChefHat,
  Calculator,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isAdmin }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'fichas', label: 'Fichas Técnicas', icon: FileText },
    { id: 'ingredientes', label: 'Ingredientes', icon: Package },
    { id: 'calculadora', label: 'Calculadora', icon: Calculator },
  ];

  const adminItems = [
    { id: 'admin-users', label: 'Usuários', icon: Users },
    { id: 'admin-system', label: 'Sistema', icon: Database },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Gestão Culinária</span>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
          
          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Administração
                </span>
              </div>
              {adminItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-accent"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
