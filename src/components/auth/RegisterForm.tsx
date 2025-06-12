
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
    <div className="w-full max-w-md mx-auto p-8 bg-white/25 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/Logo _ Bem Ti Vê-09.png" 
            alt="Bem Ti Vê - Comida Saudável" 
            className="h-56 w-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 font-heading">
          Criar conta
        </h1>
        <p className="text-white/80 font-body">
          Junte-se ao sistema de gestão culinária
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white font-body">Nome completo *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-body">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-white font-body">Empresa/Negócio</Label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da sua empresa"
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white font-body">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-body">Senha *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
          {formData.password && (
            <div className="text-xs space-y-1 mt-2">
              <div className={passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}>
                ✓ Mínimo 8 caracteres
              </div>
              <div className={passwordValidation.hasUpper ? 'text-green-400' : 'text-red-400'}>
                ✓ Uma letra maiúscula
              </div>
              <div className={passwordValidation.hasLower ? 'text-green-400' : 'text-red-400'}>
                ✓ Uma letra minúscula
              </div>
              <div className={passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}>
                ✓ Um número
              </div>
              <div className={passwordValidation.hasSpecial ? 'text-green-400' : 'text-red-400'}>
                ✓ Um caractere especial
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white font-body">Confirmar senha *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-bem-ti-ve-orange hover:bg-bem-ti-ve-orange-dark text-white font-medium py-3 rounded-lg transition-all duration-200 font-body"
          disabled={loading || !passwordValidation.valid}
        >
          {loading ? 'Criando conta...' : 'Criar conta'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <div className="text-sm text-white/80 font-body">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-bem-ti-ve-orange hover:text-bem-ti-ve-orange-dark font-medium transition-colors"
          >
            Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
