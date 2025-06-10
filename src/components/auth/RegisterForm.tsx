
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/logo';

interface RegisterFormProps {
  onToggleForm: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      valid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passwordValidation = validatePassword(formData.password);
      
      if (!passwordValidation.valid) {
        toast({
          variant: "destructive",
          title: "Senha inválida",
          description: "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.",
        });
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          variant: "destructive",
          title: "Senhas não coincidem",
          description: "As senhas digitadas não são iguais.",
        });
        setLoading(false);
        return;
      }

      const success = await register(formData);
      if (success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao sistema Bem Ti Vê",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: "Não foi possível criar sua conta. Tente novamente.",
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

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-2xl shadow-xl border border-border">
      <div className="text-center mb-8">
        <Logo size="lg" className="justify-center mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Criar conta
        </h1>
        <p className="text-muted-foreground">
          Junte-se ao sistema de gestão culinária
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa/Negócio</Label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da sua empresa"
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className="form-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
            className="form-input"
          />
          {formData.password && (
            <div className="text-xs space-y-1 mt-2">
              <div className={passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}>
                ✓ Mínimo 8 caracteres
              </div>
              <div className={passwordValidation.hasUpper ? 'text-green-600' : 'text-red-600'}>
                ✓ Uma letra maiúscula
              </div>
              <div className={passwordValidation.hasLower ? 'text-green-600' : 'text-red-600'}>
                ✓ Uma letra minúscula
              </div>
              <div className={passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}>
                ✓ Um número
              </div>
              <div className={passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-600'}>
                ✓ Um caractere especial
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            required
            className="form-input"
          />
        </div>

        <Button
          type="submit"
          className="w-full btn-primary"
          disabled={loading || !passwordValidation.valid}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
