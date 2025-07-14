import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calculator, Save, Check } from 'lucide-react';
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';
import { useIngredientes } from '@/hooks/useIngredientes';
import { useMixes } from '@/hooks/useMixes';
import { NovaFichaTecnicaFormData, IngredienteFicha, FichaTecnica } from '@/types/ficha-tecnica';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  nome_receita: z.string().min(2, 'Nome da receita é obrigatório'),
  ingredientes: z.array(z.object({
    id: z.string(),
    ingrediente_id: z.string(),
    nome: z.string(),
    quantidade_usada: z.union([z.number(), z.string()]).refine(val => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return !isNaN(num) && num > 0;
    }, 'Quantidade deve ser maior que 0'),
    unidade: z.string(),
    preco_unitario: z.number(),
    peso_compra: z.string(),
    fator_correcao: z.number(),
  })).min(1, 'Adicione pelo menos um ingrediente'),
  gas_energia: z.number().min(0, 'Valor deve ser positivo'),
  embalagem: z.number().min(0, 'Valor deve ser positivo'),
  mao_obra: z.number().min(0, 'Valor deve ser positivo'),
  outros: z.number().min(0, 'Valor deve ser positivo'),
  rendimento: z.number().min(0.01, 'Rendimento deve ser maior que 0'),
  unidade_rendimento: z.string().min(1, 'Unidade de rendimento é obrigatória'),
  margem_lucro: z.number().min(0, 'Margem deve ser positiva'),
});

// Função para validar nome duplicado
const createFormSchemaWithValidation = (verificarNomeDuplicado: (nome: string, idIgnorar?: string) => boolean, fichaTecnicaId?: string) => {
  return formSchema.extend({
    nome_receita: z.string()
      .min(2, 'Nome da receita é obrigatório')
      .refine((nome) => !verificarNomeDuplicado(nome, fichaTecnicaId), {
        message: 'Já existe uma ficha técnica com este nome'
      })
  });
};

interface FormularioFichaTecnicaProps {
  fichaTecnica?: FichaTecnica;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FormularioFichaTecnica: React.FC<FormularioFichaTecnicaProps> = ({
  fichaTecnica,
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { ingredientes, loading: loadingIngredientes } = useIngredientes();
  const { mixes } = useMixes();
  const {
    criarFichaTecnica,
    atualizarFichaTecnica,
    calcularFichaTecnica,
    verificarNomeDuplicado,
  } = useFichasTecnicas();

  const [resultadoCalculo, setResultadoCalculo] = useState<any>(null);
  const [dadosAlterados, setDadosAlterados] = useState(false);
  const [calculoRealizado, setCalculoRealizado] = useState(false);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');
  const [filtroIngrediente, setFiltroIngrediente] = useState('');

  // Criar o schema com validação de nome duplicado
  const formSchemaWithValidation = createFormSchemaWithValidation(verificarNomeDuplicado, fichaTecnica?.id);

  const form = useForm<NovaFichaTecnicaFormData>({
    resolver: zodResolver(formSchemaWithValidation),
    defaultValues: {
      nome_receita: fichaTecnica?.nome_receita || '',
      ingredientes: fichaTecnica?.ingredientes || [],
      gas_energia: fichaTecnica?.gas_energia || 1.50,
      embalagem: fichaTecnica?.embalagem || 1.00,
      mao_obra: fichaTecnica?.mao_obra || 1.00,
      outros: fichaTecnica?.outros || 0.00,
      rendimento: fichaTecnica?.rendimento || 1,
      unidade_rendimento: fichaTecnica?.unidade_rendimento || 'unidade',
      margem_lucro: fichaTecnica?.margem_lucro || 100,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredientes',
  });

  // Detectar alterações no formulário
  useEffect(() => {
    const subscription = form.watch(() => {
      setDadosAlterados(true);
      setCalculoRealizado(false);
      setResultadoCalculo(null);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const adicionarIngrediente = () => {
    if (!ingredienteSelecionado || ingredienteSelecionado.startsWith('fallback-')) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um ingrediente válido da lista.",
      });
      return;
    }
    
    const ingrediente = todosItensValidos.find(item => item.id === ingredienteSelecionado);
    if (!ingrediente) {
      toast({
        variant: "destructive",
        title: "Erro", 
        description: "Ingrediente não encontrado. Tente recarregar a página.",
      });
      return;
    }

    console.log('✅ Ingrediente encontrado:', ingrediente);

    const novoIngrediente: IngredienteFicha = {
      id: Date.now().toString(),
      ingrediente_id: ingrediente.id,
      nome: ingrediente.alimento,
      quantidade_usada: 0,
      unidade: ingrediente.unidade,
      preco_unitario: ingrediente.preco,
      peso_compra: ingrediente.peso,
      fator_correcao: ingrediente.fator_correcao,
    };

    append(novoIngrediente);
    setIngredienteSelecionado('');
    console.log('✅ Ingrediente adicionado à ficha:', novoIngrediente);
  };

  const calcular = () => {
    const dados = form.getValues();
    try {
      const resultado = calcularFichaTecnica(dados);
      setResultadoCalculo(resultado);
      setDadosAlterados(false);
      setCalculoRealizado(true);
      
      toast({
        title: "Calculado com sucesso!",
        description: "Os custos foram calculados com base nos dados informados.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no cálculo",
        description: "Verifique se todos os campos estão preenchidos corretamente.",
      });
    }
  };

  const salvarFicha = () => {
    if (!resultadoCalculo) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Realize o cálculo antes de salvar.",
      });
      return;
    }

    const dados = form.getValues();

    if (fichaTecnica) {
      // Atualizar ficha existente
      atualizarFichaTecnica(fichaTecnica.id, {
        ...dados,
        custo_total: resultadoCalculo.custo_total,
        custo_por_unidade: resultadoCalculo.custo_por_unidade,
        preco_venda_sugerido: resultadoCalculo.preco_venda_sugerido,
      });
      
      toast({
        title: "Ficha atualizada!",
        description: "A ficha técnica foi atualizada com sucesso.",
      });
    } else {
      // Criar nova ficha - validação já feita no schema
      criarFichaTecnica(dados);
      
      toast({
        title: "Ficha criada!",
        description: "A ficha técnica foi criada e salva com sucesso.",
      });
    }

    setDadosAlterados(false);
    onSuccess?.();
  };

  const calcularESalvar = (dados: NovaFichaTecnicaFormData) => {
    if (fichaTecnica) {
      // Atualizar ficha existente
      const resultado = calcularFichaTecnica(dados);
      atualizarFichaTecnica(fichaTecnica.id, {
        ...dados,
        custo_total: resultado.custo_total,
        custo_por_unidade: resultado.custo_por_unidade,
        preco_venda_sugerido: resultado.preco_venda_sugerido,
      });
      
      toast({
        title: "Ficha atualizada!",
        description: "A ficha técnica foi atualizada com sucesso.",
      });
    } else {
      // Criar nova ficha - validação já feita no schema
      criarFichaTecnica(dados);
      
      toast({
        title: "Ficha criada!",
        description: "A ficha técnica foi criada e salva com sucesso.",
      });
    }

    setDadosAlterados(false);
    onSuccess?.();
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getBotaoTexto = () => {
    if (!fichaTecnica) {
      return 'Calcular e salvar';
    }
    
    if (dadosAlterados && calculoRealizado) {
      return 'Calcular novamente e salvar';
    }
    
    return 'Calcular e salvar';
  };

  // Debug dos ingredientes
  console.log('🔍 Estado dos ingredientes:', {
    total: ingredientes.length,
    loading: loadingIngredientes,
    ingredientes: ingredientes.map(ing => ({ id: ing.id, nome: ing.alimento, ativo: ing.ativo }))
  });

  // Converter mixes para formato de ingrediente
  const mixesComoIngredientes = mixes.map(mix => ({
    id: mix.id,
    alimento: `${mix.nome} (Mix)`,
    categoria: mix.categoria,
    preco: mix.preco_total,
    peso: mix.peso_total,
    unidade: mix.unidade,
    fator_correcao: mix.fator_correcao,
    ativo: mix.ativo,
  }));

  // Combinar ingredientes e mixes válidos e ordenar alfabeticamente
  const todosItensValidos = [
    ...ingredientes.filter(ing => ing.id && ing.ativo),
    ...mixesComoIngredientes.filter(mix => mix.id && mix.ativo)
  ].sort((a, b) => a.alimento.localeCompare(b.alimento, 'pt-BR'));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-heading">
            {fichaTecnica ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calcularESalvar)} className="space-y-6">
              {/* Nome da receita */}
              <FormField
                control={form.control}
                name="nome_receita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Receita</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bolo de Chocolate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ingredientes */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Ingredientes</h3>
                </div>

                {/* Seção para adicionar ingrediente com layout melhorado */}
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">
                          Buscar Ingrediente
                        </label>
                        <Input
                          placeholder="Digite para filtrar ingredientes..."
                          value={filtroIngrediente}
                          onChange={(e) => setFiltroIngrediente(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">
                          Selecionar Ingrediente
                        </label>
                        <Select 
                          value={ingredienteSelecionado} 
                          onValueChange={setIngredienteSelecionado}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um ingrediente..." />
                          </SelectTrigger>
                          <SelectContent 
                            className="z-50 max-h-[200px] overflow-y-auto"
                            side="bottom"
                            align="start"
                          >
                            {loadingIngredientes ? (
                              <SelectItem key="loading" value="loading" disabled>
                                Carregando ingredientes...
                              </SelectItem>
                            ) : (() => {
                              const itensFiltrados = todosItensValidos.filter(item =>
                                item.alimento.toLowerCase().includes(filtroIngrediente.toLowerCase())
                              );
                              
                              return itensFiltrados.length === 0 ? (
                                <SelectItem key="empty" value="empty" disabled>
                                  {filtroIngrediente ? 'Nenhum ingrediente encontrado com esse filtro' : 'Nenhum ingrediente ou mix encontrado'}
                                </SelectItem>
                              ) : (
                                itensFiltrados.map((item) => (
                                  <SelectItem 
                                    key={item.id} 
                                    value={item.id}
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span>{item.alimento}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {item.unidade}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              );
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        onClick={adicionarIngrediente}
                        disabled={!ingredienteSelecionado || loadingIngredientes}
                        className="flex items-center gap-2 px-6"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </Card>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{field.nome || 'Ingrediente sem nome'}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Preço: {formatarMoeda(field.preco_unitario)}</span>
                          <span>Peso: {field.peso_compra} {field.unidade && <span>({field.unidade})</span>}</span>
                          <span>Fator: {field.fator_correcao}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`ingredientes.${index}.quantidade_usada`}
                      render={({ field: quantidadeField }) => (
                        <FormItem>
                          <FormLabel>Quantidade Usada ({field.unidade})</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0.00"
                              value={quantidadeField.value}
                              onChange={(e) => {
                                const value = e.target.value;
                                quantidadeField.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}

                {fields.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum ingrediente adicionado. Use o seletor acima para adicionar ingredientes.
                  </p>
                )}
              </div>

              <Separator />

              {/* Custos adicionais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Custos Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gas_energia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gás/Energia (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="embalagem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Embalagem (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mao_obra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mão de Obra (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="outros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outros (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Rendimento e margem */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rendimento e Margem</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rendimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rendimento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unidade_rendimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Rendimento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a unidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="unidade" value="unidade">Unidade</SelectItem>
                            <SelectItem key="porcao" value="porção">Porção</SelectItem>
                            <SelectItem key="fatia" value="fatia">Fatia</SelectItem>
                            <SelectItem key="bolo" value="bolo">Bolo</SelectItem>
                            <SelectItem key="litro" value="litro">Litro</SelectItem>
                            <SelectItem key="kg" value="kg">Quilograma</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="margem_lucro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margem de Lucro (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calcular}
                  className="flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  Calcular
                </Button>
                
                {calculoRealizado && resultadoCalculo && (
                  <Button 
                    type="button" 
                    onClick={salvarFicha}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar Ficha
                  </Button>
                )}
                
                <Button type="submit" className="flex-1">
                  {getBotaoTexto()}
                </Button>
                
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Resultados */}
      {resultadoCalculo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Resultados do Cálculo
              {calculoRealizado && (
                <Badge variant="secondary" className="ml-2">
                  <Check className="w-3 h-3 mr-1" />
                  Calculado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatarMoeda(resultadoCalculo.custo_total)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo por Unidade</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatarMoeda(resultadoCalculo.custo_por_unidade)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Preço de Venda Sugerido</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatarMoeda(resultadoCalculo.preco_venda_sugerido)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h4 className="font-semibold">Detalhamento dos Custos:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Ingredientes:</span>
                <span className="font-medium">{formatarMoeda(resultadoCalculo.detalhes_custos.ingredientes)}</span>
                
                <span>Gás/Energia:</span>
                <span className="font-medium">{formatarMoeda(resultadoCalculo.detalhes_custos.gas_energia)}</span>
                
                <span>Embalagem:</span>
                <span className="font-medium">{formatarMoeda(resultadoCalculo.detalhes_custos.embalagem)}</span>
                
                <span>Mão de obra:</span>
                <span className="font-medium">{formatarMoeda(resultadoCalculo.detalhes_custos.mao_obra)}</span>
                
                <span>Outros:</span>
                <span className="font-medium">{formatarMoeda(resultadoCalculo.detalhes_custos.outros)}</span>
              </div>
            </div>

            {calculoRealizado && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Cálculo realizado com sucesso! Você pode agora salvar a ficha técnica ou fazer ajustes nos valores.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
