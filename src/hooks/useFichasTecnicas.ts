
import { useState, useEffect } from 'react';
import { FichaTecnica, NovaFichaTecnicaFormData, IngredienteFicha, ResultadoCalculo } from '@/types/ficha-tecnica';
import { useIngredientes } from './useIngredientes';

const API_BASE_URL = 'http://localhost:5000/api';

export const useFichasTecnicas = () => {
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([]);
  const [loading, setLoading] = useState(false);
  const { ingredientes } = useIngredientes();

  useEffect(() => {
    carregarFichasTecnicas();
  }, []);

  const getAuthToken = () => {
    // Primeiro tentar pegar o token do formato usado pelo AuthContext
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      console.log('🔑 Token encontrado (auth_token):', authToken.substring(0, 20) + '...');
      return authToken;
    }

    // Fallback para o formato antigo
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.token) {
          console.log('🔑 Token encontrado (user.token):', userData.token.substring(0, 20) + '...');
          return userData.token;
        }
      } catch (error) {
        console.error('❌ Erro ao fazer parse do user no localStorage:', error);
      }
    }

    // Verificar também user_data
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.token) {
          console.log('🔑 Token encontrado (user_data.token):', user.token.substring(0, 20) + '...');
          return user.token;
        }
      } catch (error) {
        console.error('❌ Erro ao fazer parse do user_data no localStorage:', error);
      }
    }

    console.log('❌ Nenhum token encontrado no localStorage');
    console.log('🔍 Chaves disponíveis no localStorage:', Object.keys(localStorage));
    return null;
  };

  const carregarFichasTecnicas = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando dados do localStorage como fallback');
        const fichasSalvas = localStorage.getItem('fichas_tecnicas');
        if (fichasSalvas) {
          setFichasTecnicas(JSON.parse(fichasSalvas));
        }
        return;
      }

      console.log('🔄 Carregando fichas técnicas da API...');
      const response = await fetch(`${API_BASE_URL}/fichas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fichas técnicas carregadas da API:', data.data.fichas.length);
        setFichasTecnicas(data.data.fichas);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao carregar fichas técnicas da API:', errorData);
        // Fallback para localStorage
        const fichasSalvas = localStorage.getItem('fichas_tecnicas');
        if (fichasSalvas) {
          setFichasTecnicas(JSON.parse(fichasSalvas));
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede ao carregar fichas técnicas:', error);
      // Fallback para localStorage
      const fichasSalvas = localStorage.getItem('fichas_tecnicas');
      if (fichasSalvas) {
        setFichasTecnicas(JSON.parse(fichasSalvas));
      }
    } finally {
      setLoading(false);
    }
  };

  const salvarFichasTecnicasLocal = (fichas: FichaTecnica[]) => {
    localStorage.setItem('fichas_tecnicas', JSON.stringify(fichas));
    setFichasTecnicas(fichas);
  };

  const calcularCustoIngredientes = (ingredientesFicha: IngredienteFicha[]): number => {
    return ingredientesFicha.reduce((total, ing) => {
      const quantidadeCorrigida = ing.quantidade_usada / ing.fator_correcao;
      const pesoCompra = parseFloat(ing.peso_compra) || 1;
      const custoIngrediente = (quantidadeCorrigida / pesoCompra) * ing.preco_unitario;
      return total + custoIngrediente;
    }, 0);
  };

  const calcularFichaTecnica = (ficha: NovaFichaTecnicaFormData): ResultadoCalculo => {
    // Calcular custo dos ingredientes
    const custoIngredientes = calcularCustoIngredientes(ficha.ingredientes);
    
    // Calcular custo total
    const custoTotal = custoIngredientes + ficha.gas_energia + ficha.embalagem + ficha.mao_obra + ficha.outros;
    
    // Calcular custo por unidade
    const custoPorUnidade = custoTotal / ficha.rendimento;
    
    // Calcular preço de venda sugerido
    const precoVendaSugerido = custoPorUnidade * (1 + ficha.margem_lucro / 100);

    return {
      custo_total: custoTotal,
      custo_por_unidade: custoPorUnidade,
      preco_venda_sugerido: precoVendaSugerido,
      detalhes_custos: {
        ingredientes: custoIngredientes,
        gas_energia: ficha.gas_energia,
        embalagem: ficha.embalagem,
        mao_obra: ficha.mao_obra,
        outros: ficha.outros,
      }
    };
  };

  const criarFichaTecnica = async (dados: NovaFichaTecnicaFormData): Promise<FichaTecnica> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando localStorage');
        return criarFichaTecnicaLocal(dados);
      }

      console.log('🔄 Enviando ficha técnica para API:', dados);
      console.log('🔑 Usando token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_BASE_URL}/fichas`, {
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
        const novaFicha = result.data.ficha;
        console.log('✅ Ficha técnica criada na API:', novaFicha);
        
        // Atualizar estado local
        const novasFichas = [...fichasTecnicas, novaFicha];
        setFichasTecnicas(novasFichas);
        
        return novaFicha;
      } else {
        console.error('❌ Erro na resposta da API:', result);
        console.error('❌ Status HTTP:', response.status);
        
        // Em caso de erro na API, criar localmente
        console.log('🔄 Fallback: criando ficha técnica localmente devido ao erro da API');
        return criarFichaTecnicaLocal(dados);
      }
    } catch (error) {
      console.error('❌ Erro ao criar ficha técnica na API:', error);
      console.log('🔄 Fallback: criando ficha técnica localmente devido ao erro de rede');
      return criarFichaTecnicaLocal(dados);
    }
  };

  const criarFichaTecnicaLocal = (dados: NovaFichaTecnicaFormData): FichaTecnica => {
    const resultado = calcularFichaTecnica(dados);
    
    const novaFicha: FichaTecnica = {
      id: Date.now().toString(),
      ...dados,
      custo_total: resultado.custo_total,
      custo_por_unidade: resultado.custo_por_unidade,
      preco_venda_sugerido: resultado.preco_venda_sugerido,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const novasFichas = [...fichasTecnicas, novaFicha];
    salvarFichasTecnicasLocal(novasFichas);
    
    console.log('✅ Ficha técnica criada localmente:', novaFicha);
    return novaFicha;
  };

  const atualizarFichaTecnica = async (id: string, dados: Partial<FichaTecnica>) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando localStorage');
        return atualizarFichaTecnicaLocal(id, dados);
      }

      console.log('🔄 Atualizando ficha técnica na API:', id, dados);

      const response = await fetch(`${API_BASE_URL}/fichas/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        const result = await response.json();
        const fichaAtualizada = result.data.ficha;
        console.log('✅ Ficha técnica atualizada na API:', fichaAtualizada);
        
        // Atualizar estado local
        const fichasAtualizadas = fichasTecnicas.map(ficha => 
          ficha.id === id ? fichaAtualizada : ficha
        );
        setFichasTecnicas(fichasAtualizadas);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao atualizar ficha técnica na API:', errorData);
        atualizarFichaTecnicaLocal(id, dados);
      }
    } catch (error) {
      console.error('❌ Erro de rede ao atualizar ficha técnica:', error);
      atualizarFichaTecnicaLocal(id, dados);
    }
  };

  const atualizarFichaTecnicaLocal = (id: string, dados: Partial<FichaTecnica>) => {
    const fichasAtualizadas = fichasTecnicas.map(ficha => 
      ficha.id === id 
        ? { ...ficha, ...dados, updated_at: new Date().toISOString() }
        : ficha
    );
    
    setFichasTecnicas(fichasAtualizadas);
    localStorage.setItem('fichas_tecnicas', JSON.stringify(fichasAtualizadas));
    console.log('✅ Ficha técnica atualizada localmente');
  };

  const clonarFichaTecnica = async (fichaOriginal: FichaTecnica): Promise<FichaTecnica> => {
    const fichaCopia: NovaFichaTecnicaFormData = {
      nome_receita: `${fichaOriginal.nome_receita} (Cópia)`,
      ingredientes: [...fichaOriginal.ingredientes],
      gas_energia: fichaOriginal.gas_energia,
      embalagem: fichaOriginal.embalagem,
      mao_obra: fichaOriginal.mao_obra,
      outros: fichaOriginal.outros,
      rendimento: fichaOriginal.rendimento,
      unidade_rendimento: fichaOriginal.unidade_rendimento,
      margem_lucro: fichaOriginal.margem_lucro,
    };

    return criarFichaTecnica(fichaCopia);
  };

  const verificarNomeDuplicado = (nomeReceita: string, idIgnorar?: string): boolean => {
    return fichasTecnicas.some(ficha => 
      ficha.nome_receita.toLowerCase() === nomeReceita.toLowerCase() && 
      ficha.id !== idIgnorar
    );
  };

  const buscarIngredientePorId = (id: string) => {
    return ingredientes.find(ing => ing.id === id);
  };

  return {
    fichasTecnicas,
    loading,
    criarFichaTecnica,
    atualizarFichaTecnica,
    clonarFichaTecnica,
    calcularFichaTecnica,
    verificarNomeDuplicado,
    buscarIngredientePorId,
  };
};
