
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface ResendConfirmationFormProps {
  onBack: () => void;
}

const ResendConfirmationForm: React.FC<ResendConfirmationFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.resendConfirmation(email);
      toast({
        title: "Email reenviado com sucesso! 📧",
        description: "Verifique sua caixa de entrada para confirmar sua conta.",
      });
      
      // Voltar ao login após 2 segundos
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar email",
        description: error.message || "Não foi possível reenviar o email de confirmação.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Reenviar confirmação
        </h1>
        <p className="text-gray-600 font-body">
          Digite seu email para receber um novo link de confirmação
        </p>
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
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          disabled={loading}
        >
          {loading ? 'Reenviando...' : 'Reenviar email de confirmação'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark text-sm transition-colors font-body"
        >
          ← Voltar ao login
        </button>
      </div>

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-bem-ti-ve-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-700 font-body">
              Reenviando email de confirmação...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResendConfirmationForm;
