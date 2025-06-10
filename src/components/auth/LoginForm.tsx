
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';

interface LoginFormProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema Bem Ti Vê",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Email ou senha incorretos. Tente novamente.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no sistema",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-2xl shadow-xl border border-border">
      <div className="text-center mb-8">
        <Logo size="lg" className="justify-center mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Faça seu login
        </h1>
        <p className="text-muted-foreground">
          Acesse sua conta para gerenciar fichas técnicas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            className="form-input"
          />
        </div>

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-primary hover:text-primary/80 text-sm transition-colors"
        >
          Esqueceu sua senha?
        </button>
        
        <div className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Cadastre-se
          </button>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-bem-ti-ve-cream/20 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2 font-medium">
          🔑 Credenciais para demonstração:
        </p>
        <div className="text-xs space-y-1">
          <div>
            <strong>Admin:</strong> admin@bemtive.com / Admin123!
          </div>
          <div>
            <strong>Chef:</strong> maria@bemtive.com / Chef123!
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
