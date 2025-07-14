
import { API_BASE_URL } from '@/config/api';

export const api = {
  // Auth endpoints
  async forgotPassword(email: string) {
    console.log('🔄 Enviando request para forgot-password:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('📧 Resposta do servidor:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar email');
    }

    return data;
  },

  async resetPassword(token: string, password: string) {
    console.log('🔄 Redefinindo senha com token:', token);
    
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    console.log('🔑 Resposta da redefinição:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao redefinir senha');
    }

    return data;
  },

  async validateResetToken(token: string) {
    console.log('🔄 Validando token:', token);
    
    const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    console.log('✅ Resposta da validação:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Token inválido');
    }

    return data;
  },

  async login(email: string, password: string) {
    console.log('🔄 Fazendo login:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      const text = await response.text();
      console.log('⚠️ Resposta não é JSON:', text);
      throw new Error(text || 'Erro de comunicação com o servidor');
    }
    
    console.log('👤 Resposta do login:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro no login');
    }

    return data;
  },

  async register(userData: any) {
    console.log('🔄 Registrando usuário:', userData.email);
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: userData.name,
        email: userData.email,
        password: userData.password
      }),
    });

    const data = await response.json();
    console.log('📝 Resposta do registro:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro no cadastro');
    }

    return data;
  },

  async resendConfirmation(email: string) {
    console.log('🔄 Reenviando confirmação para:', email);
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-confirmation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('📧 Resposta do reenvio:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao reenviar confirmação');
    }

    return data;
  }
};
