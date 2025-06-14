
import { useState, useEffect } from 'react';
import { FichaTecnica, NovaFichaTecnicaFormData, IngredienteFicha, ResultadoCalculo } from '@/types/ficha-tecnica';
import { useIngredientes } from './useIngredientes';

export const useFichasTecnicas = () => {
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>([]);
  const [loading, setLoading] = useState(false);
  const { ingredientes } = useIngredientes();

  useEffect(() => {
    carregarFichasTecnicas();
  }, []);

  const carregarFichasTecnicas = () => {
    try {
      const fichasSalvas = localStorage.getItem('fichas_tecnicas');
      if (fichasSalvas) {
        setFichasTecnicas(JSON.parse(fichasSalvas));
      }
    } catch (error) {
      console.error('Erro ao carregar fichas técnicas:', error);
    }
  };

  const salvarFichasTecnicas = (fichas: FichaTecnica[]) => {
    localStorage.setItem('fichas_tecnicas', JSON.stringify(fichas));
    setFichasTecnicas(fichas);
  };

  const calcularCustoIngredientes = (ingredientesFicha: IngredienteFicha[]): number => {
    return ingredientesFicha.reduce((total, ing) => {
      const quantidadeCorrigida = ing.quantidade_usada / ing.fator_correcao;
      const custoIngrediente = (quantidadeCorrigida / ing.peso_compra) * ing.preco_unitario;
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

  const criarFichaTecnica = (dados: NovaFichaTecnicaFormData): FichaTecnica => {
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
    salvarFichasTecnicas(novasFichas);
    
    return novaFicha;
  };

  const atualizarFichaTecnica = (id: string, dados: Partial<FichaTecnica>) => {
    const fichasAtualizadas = fichasTecnicas.map(ficha => 
      ficha.id === id 
        ? { ...ficha, ...dados, updated_at: new Date().toISOString() }
        : ficha
    );
    
    salvarFichasTecnicas(fichasAtualizadas);
  };

  const clonarFichaTecnica = (fichaOriginal: FichaTecnica): FichaTecnica => {
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
