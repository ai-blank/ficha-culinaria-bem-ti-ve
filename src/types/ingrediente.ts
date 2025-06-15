
export interface Ingrediente {
  id: string;
  alimento: string;
  peso: string;
  preco: number;
  unidade: string;
  fator_correcao: number;
  categoria: string;
  ativo: boolean;
  quantidade_estoque?: number;
  data_validade?: string;
  fornecedor?: string;
  created_at: string;
  updated_at: string;
}

export interface FatorCorrecaoData {
  alimento: string;
  unidade: string;
  percentual_aproveitamento: number;
  fator_correcao: number;
  categoria?: string;
  peso?: string;
}

export interface NovoIngredienteFormData {
  alimento: string;
  peso: string;
  preco: number;
  unidade: string;
  fator_correcao: number;
  categoria: string;
  quantidade_estoque?: number;
  data_validade?: string;
  fornecedor?: string;
}
