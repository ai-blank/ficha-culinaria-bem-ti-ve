
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onProfileClick: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onProfileClick, onSettingsClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex justify-center md:justify-start">
        <img 
          src="/lovable-uploads/logo-orange-2.png" 
          alt="Bem Ti Vê - Comida Saudável" 
          className="h-8 md:h-10 w-auto"
        />
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hover-scale h-8 w-8 md:h-10 md:w-10"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Sun className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-8 md:h-10 px-2 md:px-3">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:block text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            {user?.admin && onSettingsClick && (
              <DropdownMenuItem onClick={onSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Administração
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
