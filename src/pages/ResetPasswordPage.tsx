
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Token inválido",
        description: "O link de redefinição é inválido ou expirou.",
      });
      navigate('/');
      return;
    }

    // Verificar se o token é válido
    const checkToken = async () => {
      try {
        await api.validateResetToken(token);
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        toast({
          variant: "destructive",
          title: "Link expirado",
          description: "Este link de redefinição expirou ou é inválido.",
        });
      }
    };

    checkToken();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Redefinindo senha com token:', token);
      await api.resetPassword(token, password);
      
      setSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
      });
      console.log('✅ Senha redefinida com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao redefinir senha:', error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir a senha. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
          backgroundImage: `url('/lovable-uploads/background-orange.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-bem-ti-ve-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token
  if (tokenValid === false) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
          backgroundImage: `url('/lovable-uploads/background-orange.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
              Link inválido
            </h1>
            <p className="text-gray-600 font-body">
              Este link de redefinição expirou ou é inválido.
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
          backgroundImage: `url('/lovable-uploads/background-orange.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
              Senha redefinida!
            </h1>
            <p className="text-gray-600 font-body">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          >
            Fazer login
          </Button>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%)',
        backgroundImage: `url('/lovable-uploads/background-orange.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="w-full max-w-md mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/logo-orange.png" 
              alt="Bem Ti Vê - Comida Saudável" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
            Nova senha
          </h1>
          <p className="text-gray-600 font-body">
            Digite sua nova senha abaixo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-body">Nova senha</Label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua nova senha"
              required
              minLength={6}
              className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-body">Confirmar senha</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente sua nova senha"
              required
              minLength={6}
              className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
            disabled={loading}
          >
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark text-sm transition-colors inline-flex items-center gap-2 font-body"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
