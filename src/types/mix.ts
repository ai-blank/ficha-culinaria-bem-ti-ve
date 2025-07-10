
export interface Mix {
  id: string;
  _id?: string;
  nome: string;
  ingredientes: MixIngrediente[];
  categoria: string;
  peso_total: string;
  preco_total: number;
  unidade: string;
  fator_correcao: number;
  ativo: boolean;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export interface MixIngrediente {
  ingredienteId: string | {
    id: string;
    _id?: string;
    alimento: string;
    unidade: string;
    preco: number;
  };
  quantidade: number;
  unidade: string;
}

export interface NovoMixFormData {
  nome: string;
  ingredientes: MixIngrediente[];
  categoria: string;
  peso_total: string;
  unidade: string;
  descricao?: string;
}
