
import { useState, useEffect } from 'react';
import { Ingrediente, FatorCorrecaoData, NovoIngredienteFormData } from '@/types/ingrediente';

export const useIngredientes = () => {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [fatoresCorrecao, setFatoresCorrecao] = useState<FatorCorrecaoData[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

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

      // Carregar ingredientes do localStorage
      const ingredientesSalvos = localStorage.getItem('ingredientes');
      if (ingredientesSalvos) {
        setIngredientes(JSON.parse(ingredientesSalvos));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
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
      };
    }
    
    return null;
  };

  const criarIngrediente = (dados: NovoIngredienteFormData): Ingrediente => {
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
    
    return novoIngrediente;
  };

  const atualizarIngrediente = (id: string, dados: Partial<Ingrediente>) => {
    const ingredientesAtualizados = ingredientes.map(ing => 
      ing.id === id 
        ? { ...ing, ...dados, updated_at: new Date().toISOString() }
        : ing
    );
    
    setIngredientes(ingredientesAtualizados);
    localStorage.setItem('ingredientes', JSON.stringify(ingredientesAtualizados));
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
  };
};
