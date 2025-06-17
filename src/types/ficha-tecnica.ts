
export interface IngredienteFicha {
  id: string;
  ingrediente_id: string;
  nome: string;
  quantidade_usada: number | string; // Aceitar tanto number quanto string
  unidade: string;
  preco_unitario: number;
  peso_compra: string;
  fator_correcao: number;
  custo_calculado?: number;
}

export interface FichaTecnica {
  id: string;
  nome_receita: string;
  ingredientes: IngredienteFicha[];
  gas_energia: number;
  embalagem: number;
  mao_obra: number;
  outros: number;
  rendimento: number;
  unidade_rendimento: string;
  margem_lucro: number;
  custo_total?: number;
  custo_por_unidade?: number;
  preco_venda_sugerido?: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface NovaFichaTecnicaFormData {
  nome_receita: string;
  ingredientes: IngredienteFicha[];
  gas_energia: number;
  embalagem: number;
  mao_obra: number;
  outros: number;
  rendimento: number;
  unidade_rendimento: string;
  margem_lucro: number;
}

export interface ResultadoCalculo {
  custo_total: number;
  custo_por_unidade: number;
  preco_venda_sugerido: number;
  detalhes_custos: {
    ingredientes: number;
    gas_energia: number;
    embalagem: number;
    mao_obra: number;
    outros: number;
  };
}
