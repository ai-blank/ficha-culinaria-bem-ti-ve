
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const ConfirmEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      confirmEmail();
    } else {
      setError('Token de verificação não encontrado.');
    }
  }, [token]);

  const confirmEmail = async () => {
    if (!token) return;

    setIsConfirming(true);
    try {
      console.log('🔄 Confirmando email com token:', token);
      
      const response = await fetch(`http://localhost:5000/api/auth/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      console.log('📧 Resposta da confirmação:', data);

      if (response.ok && data.success) {
        setIsConfirmed(true);
        toast({
          title: "Email verificado com sucesso!",
          description: "Sua conta foi ativada. Agora você pode fazer login.",
        });
      } else {
        setError(data.message || 'Erro ao verificar email');
        toast({
          variant: "destructive",
          title: "Erro na verificação",
          description: data.message || "Token inválido ou expirado.",
        });
      }
    } catch (error) {
      console.error('❌ Erro na confirmação:', error);
      setError('Erro de conexão. Tente novamente.');
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível verificar o email. Tente novamente.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

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
            Verificação de Email
          </h1>
        </div>

        <div className="text-center space-y-4">
          {isConfirming && (
            <div>
              <div className="w-8 h-8 border-4 border-bem-ti-ve-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700 font-body">Verificando seu email...</p>
            </div>
          )}

          {isConfirmed && (
            <div className="space-y-4">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-gray-800 font-heading">
                Email verificado com sucesso!
              </h2>
              <p className="text-gray-600 font-body">
                Sua conta foi ativada. Agora você pode fazer login no sistema.
              </p>
              <Link to="/">
                <Button className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body">
                  Ir para Login
                </Button>
              </Link>
            </div>
          )}

          {error && !isConfirming && (
            <div className="space-y-4">
              <div className="text-red-600 text-5xl mb-4">✗</div>
              <h2 className="text-xl font-semibold text-gray-800 font-heading">
                Erro na verificação
              </h2>
              <p className="text-gray-600 font-body">{error}</p>
              <Link to="/">
                <Button className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body">
                  Voltar ao Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
