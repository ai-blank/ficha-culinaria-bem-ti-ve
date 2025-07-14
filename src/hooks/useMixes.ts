
import { useState, useEffect } from 'react';
import { Mix, NovoMixFormData } from '@/types/mix';

import { API_BASE_URL } from '@/config/api';

export const useMixes = () => {
  const [mixes, setMixes] = useState<Mix[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarMixes();
  }, []);

  const getAuthToken = () => {
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      console.log('🔑 Token encontrado:', authToken.substring(0, 20) + '...');
      return authToken;
    }

    console.log('❌ Nenhum token encontrado no localStorage');
    return null;
  };

  const carregarMixes = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('⚠️ Token não encontrado, usando dados do localStorage como fallback');
        const mixesSalvos = localStorage.getItem('mixes');
        if (mixesSalvos) {
          setMixes(JSON.parse(mixesSalvos));
        }
        return;
      }

      console.log('🔄 Carregando mixes da API...');
      const response = await fetch(`${API_BASE_URL}/mixes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Mixes carregados da API:', data.data.mixes.length);
        
        const mixesNormalizados = data.data.mixes.map((mix: any) => ({
          ...mix,
          id: mix._id || mix.id
        }));
        
        setMixes(mixesNormalizados);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao carregar mixes da API:', errorData);
        const mixesSalvos = localStorage.getItem('mixes');
        if (mixesSalvos) {
          setMixes(JSON.parse(mixesSalvos));
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede ao carregar mixes:', error);
      const mixesSalvos = localStorage.getItem('mixes');
      if (mixesSalvos) {
        setMixes(JSON.parse(mixesSalvos));
      }
    }
  };

  const criarMix = async (dados: NovoMixFormData): Promise<Mix> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando localStorage');
        return criarMixLocal(dados);
      }

      console.log('🔄 Enviando mix para API:', dados);

      const response = await fetch(`${API_BASE_URL}/mixes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      console.log('📡 Status da resposta da API:', response.status);
      
      const result = await response.json();
      console.log('📡 Resposta da API:', result);

      if (response.ok && result.success) {
        const novoMix = {
          ...result.data.mix,
          id: result.data.mix._id || result.data.mix.id
        };
        console.log('✅ Mix criado na API:', novoMix);
        
        const novosMixes = [...mixes, novoMix];
        setMixes(novosMixes);
        
        return novoMix;
      } else {
        console.error('❌ Erro na resposta da API:', result);
        console.log('🔄 Fallback: criando mix localmente devido ao erro da API');
        return criarMixLocal(dados);
      }
    } catch (error) {
      console.error('❌ Erro ao criar mix na API:', error);
      console.log('🔄 Fallback: criando mix localmente devido ao erro de rede');
      return criarMixLocal(dados);
    }
  };

  const criarMixLocal = (dados: NovoMixFormData): Mix => {
    const novoMix: Mix = {
      id: Date.now().toString(),
      ...dados,
      preco_total: 0, // Será calculado
      fator_correcao: 1.0, // Valor padrão
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const novosMixes = [...mixes, novoMix];
    setMixes(novosMixes);
    localStorage.setItem('mixes', JSON.stringify(novosMixes));
    
    console.log('✅ Mix criado localmente:', novoMix);
    return novoMix;
  };

  const verificarNomeDuplicado = (nome: string, idIgnorar?: string): boolean => {
    return mixes.some(mix => 
      mix.nome.toLowerCase() === nome.toLowerCase() && 
      mix.id !== idIgnorar
    );
  };

  return {
    mixes,
    loading,
    criarMix,
    verificarNomeDuplicado,
    carregarMixes,
  };
};
