
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    <div className="w-full max-w-md mx-auto p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/0495dd21-8452-4483-9264-fd17c4d9f971.png" 
            alt="Bem Ti Vê - Comida Saudável" 
            className="h-32 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2 font-heading">
          Faça seu login
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-body">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange/20 focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-body">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange/20 focus:ring-1"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          type="button"
          onClick={onForgotPassword}
          className="block w-full text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark text-sm transition-colors font-body"
        >
          Esqueceu sua senha?
        </button>
        
        <div className="text-sm text-gray-600 font-body">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark font-medium transition-colors"
          >
            Cadastre-se
          </button>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="mt-8 p-4 bg-white/40 rounded-lg border border-white/20">
        <p className="text-xs text-gray-600 mb-2 font-medium font-body">
          🔑 Credenciais para demonstração:
        </p>
        <div className="text-xs space-y-1 font-body">
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
