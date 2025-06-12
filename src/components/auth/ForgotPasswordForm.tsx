
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para recuperar sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bem-ti-ve-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-bem-ti-ve-orange" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
            Email enviado!
          </h1>
          <p className="text-gray-600 font-body">
            Enviamos um link para recuperação de senha para <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center font-body">
            Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
          </p>
          
          <Button
            onClick={onBack}
            className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/0495dd21-8452-4483-9264-fd17c4d9f971.png" 
            alt="Bem Ti Vê - Comida Saudável" 
            className="h-48 w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 font-heading">
          Recuperar senha
        </h1>
        <p className="text-gray-600 font-body">
          Digite seu email para receber um link de recuperação
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
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark text-sm transition-colors inline-flex items-center gap-2 font-body"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
