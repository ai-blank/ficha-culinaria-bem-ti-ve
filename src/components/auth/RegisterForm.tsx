import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
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

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    // Aplica a máscara
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
          title: "Cadastro realizado com sucesso! 📧",
          description: "Verifique seu email para confirmar sua conta e ativar o acesso ao sistema.",
        });
        
        // Aguardar um momento para o usuário ler a mensagem, depois voltar ao login
        setTimeout(() => {
          onToggleForm();
        }, 3000);
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
          Criar conta
        </h1>
        <p className="text-gray-600 font-body">
          Junte-se ao sistema de gestão culinária
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-700 font-body">Nome completo *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 font-body">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-gray-700 font-body">Empresa/Negócio</Label>
          <Input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da sua empresa"
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700 font-body">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            maxLength={15}
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700 font-body">Senha *</Label>
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Sua senha"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
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
          <Label htmlFor="confirmPassword" className="text-gray-700 font-body">Confirmar senha *</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            required
            className="bg-white/60 border-white/50 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-bem-ti-ve-orange focus:ring-bem-ti-ve-orange focus:ring-1"
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
        <div className="text-sm text-gray-600 font-body">
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

      {loading && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-bem-ti-ve-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-blue-700 font-body">
              Criando sua conta e enviando email de confirmação...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
