
import { useState, useEffect } from 'react';
import { Ingrediente, FatorCorrecaoData, NovoIngredienteFormData } from '@/types/ingrediente';

const API_BASE_URL = 'http://localhost:5000/api';

export const useIngredientes = () => {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fatoresCorrecao, setFatoresCorrecao] = useState<FatorCorrecaoData[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar categorias
      const categoriasResponse = await fetch('/data/categorias.json');
      const categoriasData = await categoriasResponse.json();
      setCategorias(categoriasData);

      // Carregar fatores de correção
      const fatoresResponse = await fetch('/data/tabela_fator_correcao_completa.json');
      const fatoresData = await fatoresResponse.json();
      setFatoresCorrecao(fatoresData);

      // Carregar ingredientes da API
      await carregarIngredientes();
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarIngredientes = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('⚠️ Token não encontrado, usando dados do localStorage como fallback');
        const ingredientesSalvos = localStorage.getItem('ingredientes');
        if (ingredientesSalvos) {
          setIngredientes(JSON.parse(ingredientesSalvos));
        }
        return;
      }

      console.log('🔄 Carregando ingredientes da API...');
      const response = await fetch(`${API_BASE_URL}/ingredientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Ingredientes carregados da API:', data.data.ingredientes.length);
        setIngredientes(data.data.ingredientes);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao carregar ingredientes da API:', errorData);
        // Fallback para localStorage
        const ingredientesSalvos = localStorage.getItem('ingredientes');
        if (ingredientesSalvos) {
          setIngredientes(JSON.parse(ingredientesSalvos));
        }
      }
    } catch (error) {
      console.error('❌ Erro de rede ao carregar ingredientes:', error);
      // Fallback para localStorage
      const ingredientesSalvos = localStorage.getItem('ingredientes');
      if (ingredientesSalvos) {
        setIngredientes(JSON.parse(ingredientesSalvos));
      }
    }
  };

  const extrairUnidade = (alimentoCompleto: string): { alimento: string; unidade: string } => {
    const palavras = alimentoCompleto.trim().split(' ');
    const ultimaPalavra = palavras[palavras.length - 1].toLowerCase();
    
    // Unidades comuns
    const unidadesComuns = ['kg', 'g', 'ml', 'l', 'un', 'dz', 'pct'];
    
    if (unidadesComuns.includes(ultimaPalavra)) {
      const alimento = palavras.slice(0, -1).join(' ');
      return { alimento, unidade: ultimaPalavra };
    }
    
    return { alimento: alimentoCompleto, unidade: 'un' };
  };

  const buscarFatorCorrecao = (alimento: string): number => {
    const fator = fatoresCorrecao.find(f => 
      f.alimento.toLowerCase().includes(alimento.toLowerCase())
    );
    return fator?.fator_correcao || 1.0;
  };

  const buscarAlimentosNaBase = (termoBusca: string) => {
    if (!termoBusca || termoBusca.length < 2) return [];
    
    return fatoresCorrecao.filter(fator => 
      fator.alimento.toLowerCase().includes(termoBusca.toLowerCase())
    ).slice(0, 10); // Limitar a 10 resultados
  };

  const obterDadosAlimentoDaBase = (nomeAlimento: string) => {
    const alimentoEncontrado = fatoresCorrecao.find(f => 
      f.alimento.toLowerCase() === nomeAlimento.toLowerCase()
    );
    
    if (alimentoEncontrado) {
      return {
        alimento: alimentoEncontrado.alimento,
        categoria: alimentoEncontrado.categoria || 'Outros',
        unidade: alimentoEncontrado.unidade || 'kg',
        fator_correcao: alimentoEncontrado.fator_correcao || 1.0,
        peso: alimentoEncontrado.peso || '1.0',
      };
    }
    
    return null;
  };

  const adicionarAlimentoNaBase = (dados: NovoIngredienteFormData) => {
    // Verificar se o alimento já existe na base
    const alimentoExiste = fatoresCorrecao.some(f => 
      f.alimento.toLowerCase() === dados.alimento.toLowerCase()
    );

    if (!alimentoExiste) {
      const novoAlimentoBase: FatorCorrecaoData = {
        alimento: dados.alimento.toUpperCase(),
        categoria: dados.categoria,
        peso: dados.peso,
        unidade: dados.unidade,
        fator_correcao: dados.fator_correcao,
        percentual_aproveitamento: Math.round((1 / dados.fator_correcao) * 100)
      };

      // Adicionar ao array local
      const novosFatoresCorrecao = [...fatoresCorrecao, novoAlimentoBase];
      setFatoresCorrecao(novosFatoresCorrecao);

      // Salvar no localStorage como backup
      const baseDadosLocal = localStorage.getItem('base_alimentos_customizada') || '[]';
      const alimentosCustomizados = JSON.parse(baseDadosLocal);
      alimentosCustomizados.push(novoAlimentoBase);
      localStorage.setItem('base_alimentos_customizada', JSON.stringify(alimentosCustomizados));

      console.log('✅ Novo alimento adicionado à base de dados:', novoAlimentoBase);
      
      return novoAlimentoBase;
    }
    
    return null;
  };

  const carregarAlimentosCustomizados = () => {
    try {
      const baseDadosLocal = localStorage.getItem('base_alimentos_customizada');
      if (baseDadosLocal) {
        const alimentosCustomizados = JSON.parse(baseDadosLocal);
        // Mesclar com os dados existentes, evitando duplicatas
        const fatoresMesclados = [...fatoresCorrecao];
        
        alimentosCustomizados.forEach((alimentoCustomizado: FatorCorrecaoData) => {
          const existe = fatoresMesclados.some(f => 
            f.alimento.toLowerCase() === alimentoCustomizado.alimento.toLowerCase()
          );
          if (!existe) {
            fatoresMesclados.push(alimentoCustomizado);
          }
        });
        
        setFatoresCorrecao(fatoresMesclados);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar alimentos customizados:', error);
    }
  };

  // Carregar alimentos customizados quando os dados principais forem carregados
  useEffect(() => {
    if (fatoresCorrecao.length > 0) {
      carregarAlimentosCustomizados();
    }
  }, []);

  const criarIngrediente = async (dados: NovoIngredienteFormData): Promise<Ingrediente> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando localStorage');
        return criarIngredienteLocal(dados);
      }

      console.log('🔄 Enviando ingrediente para API:', dados);
      console.log('🔑 Usando token:', token.substring(0, 20) + '...');

      // Adicionar alimento à base de dados se não existir
      adicionarAlimentoNaBase(dados);

      const response = await fetch(`${API_BASE_URL}/ingredientes`, {
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
        const novoIngrediente = result.data.ingrediente;
        console.log('✅ Ingrediente criado na API:', novoIngrediente);
        
        // Atualizar estado local
        const novosIngredientes = [...ingredientes, novoIngrediente];
        setIngredientes(novosIngredientes);
        
        return novoIngrediente;
      } else {
        console.error('❌ Erro na resposta da API:', result);
        console.error('❌ Status HTTP:', response.status);
        
        // Em caso de erro na API, criar localmente
        console.log('🔄 Fallback: criando ingrediente localmente devido ao erro da API');
        return criarIngredienteLocal(dados);
      }
    } catch (error) {
      console.error('❌ Erro ao criar ingrediente na API:', error);
      console.log('🔄 Fallback: criando ingrediente localmente devido ao erro de rede');
      return criarIngredienteLocal(dados);
    }
  };

  const criarIngredienteLocal = (dados: NovoIngredienteFormData): Ingrediente => {
    // Adicionar alimento à base de dados se não existir
    adicionarAlimentoNaBase(dados);

    const novoIngrediente: Ingrediente = {
      id: Date.now().toString(),
      ...dados,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const novosIngredientes = [...ingredientes, novoIngrediente];
    setIngredientes(novosIngredientes);
    localStorage.setItem('ingredientes', JSON.stringify(novosIngredientes));
    
    console.log('✅ Ingrediente criado localmente:', novoIngrediente);
    return novoIngrediente;
  };

  const atualizarIngrediente = async (id: string, dados: Partial<Ingrediente>) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.log('⚠️ Token não encontrado, usando localStorage');
        return atualizarIngredienteLocal(id, dados);
      }

      console.log('🔄 Atualizando ingrediente na API:', id, dados);

      const response = await fetch(`${API_BASE_URL}/ingredientes/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        const result = await response.json();
        const ingredienteAtualizado = result.data.ingrediente;
        console.log('✅ Ingrediente atualizado na API:', ingredienteAtualizado);
        
        // Atualizar estado local imediatamente
        const ingredientesAtualizados = ingredientes.map(ing => 
          ing.id === id ? ingredienteAtualizado : ing
        );
        setIngredientes(ingredientesAtualizados);
      } else {
        const errorData = await response.json();
        console.error('❌ Erro ao atualizar ingrediente na API:', errorData);
        atualizarIngredienteLocal(id, dados);
      }
    } catch (error) {
      console.error('❌ Erro de rede ao atualizar ingrediente:', error);
      atualizarIngredienteLocal(id, dados);
    }
  };

  const atualizarIngredienteLocal = (id: string, dados: Partial<Ingrediente>) => {
    const ingredientesAtualizados = ingredientes.map(ing => 
      ing.id === id 
        ? { ...ing, ...dados, updated_at: new Date().toISOString() }
        : ing
    );
    
    setIngredientes(ingredientesAtualizados);
    localStorage.setItem('ingredientes', JSON.stringify(ingredientesAtualizados));
    console.log('✅ Ingrediente atualizado localmente');
  };

  const verificarNomeDuplicado = (alimento: string, idIgnorar?: string): boolean => {
    return ingredientes.some(ing => 
      ing.alimento.toLowerCase() === alimento.toLowerCase() && 
      ing.id !== idIgnorar
    );
  };

  const converterUnidade = (valor: number, unidadeOrigem: string, unidadeDestino: string): number => {
    const conversoes: Record<string, Record<string, number>> = {
      'kg': { 'g': 1000, 'kg': 1 },
      'g': { 'kg': 0.001, 'g': 1 },
      'l': { 'ml': 1000, 'l': 1 },
      'ml': { 'l': 0.001, 'ml': 1 },
    };

    if (conversoes[unidadeOrigem] && conversoes[unidadeOrigem][unidadeDestino]) {
      return valor * conversoes[unidadeOrigem][unidadeDestino];
    }
    
    return valor;
  };

  // Função para recarregar ingredientes
  const recarregarIngredientes = () => {
    carregarIngredientes();
  };

  return {
    ingredientes,
    categorias,
    fatoresCorrecao,
    loading,
    criarIngrediente,
    atualizarIngrediente,
    verificarNomeDuplicado,
    extrairUnidade,
    buscarFatorCorrecao,
    converterUnidade,
    buscarAlimentosNaBase,
    obterDadosAlimentoDaBase,
    adicionarAlimentoNaBase,
    recarregarIngredientes,
  };
};
