
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail } from 'lucide-react';
import Logo from '@/components/ui/logo';

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
      <div className="w-full max-w-md mx-auto p-8 bg-card rounded-2xl shadow-xl border border-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-bem-ti-ve-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-bem-ti-ve-green" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Email enviado!
          </h1>
          <p className="text-muted-foreground">
            Enviamos um link para recuperação de senha para <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Não recebeu o email? Verifique sua caixa de spam ou tente novamente em alguns minutos.
          </p>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-2xl shadow-xl border border-border">
      <div className="text-center mb-8">
        <Logo size="lg" className="justify-center mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Recuperar senha
        </h1>
        <p className="text-muted-foreground">
          Digite seu email para receber um link de recuperação
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

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground text-sm transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
