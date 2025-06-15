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
import { NovaFichaTecnicaFormData, IngredienteFicha, FichaTecnica } from '@/types/ficha-tecnica';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  nome_receita: z.string().min(2, 'Nome da receita é obrigatório'),
  ingredientes: z.array(z.object({
    id: z.string(),
    ingrediente_id: z.string(),
    nome: z.string(),
    quantidade_usada: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
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
  const { ingredientes } = useIngredientes();
  const {
    criarFichaTecnica,
    atualizarFichaTecnica,
    calcularFichaTecnica,
    verificarNomeDuplicado,
  } = useFichasTecnicas();

  const [resultadoCalculo, setResultadoCalculo] = useState<any>(null);
  const [dadosAlterados, setDadosAlterados] = useState(false);
  const [calculoRealizado, setCalculoRealizado] = useState(false);

  const form = useForm<NovaFichaTecnicaFormData>({
    resolver: zodResolver(formSchema),
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

  const adicionarIngrediente = (ingredienteId: string) => {
    const ingrediente = ingredientes.find(ing => ing.id === ingredienteId);
    if (!ingrediente) return;

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
      // Criar nova ficha
      if (verificarNomeDuplicado(dados.nome_receita)) {
        toast({
          variant: "destructive",
          title: "Nome duplicado",
          description: "Já existe uma ficha técnica com este nome.",
        });
        return;
      }

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
      // Criar nova ficha
      if (verificarNomeDuplicado(dados.nome_receita)) {
        toast({
          variant: "destructive",
          title: "Nome duplicado",
          description: "Já existe uma ficha técnica com este nome.",
        });
        return;
      }

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
                  <Select onValueChange={adicionarIngrediente}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="+ Adicionar ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredientes
                        .filter(ing => ing.ativo)
                        .map((ingrediente) => (
                          <SelectItem key={ingrediente.id} value={ingrediente.id}>
                            {ingrediente.alimento}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{field.nome}</h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Preço: {formatarMoeda(field.preco_unitario)}</span>
                          <span>Peso: {field.peso_compra} {field.unidade}</span>
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
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...quantidadeField}
                              onChange={(e) => quantidadeField.onChange(parseFloat(e.target.value) || 0)}
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
                            <SelectItem value="unidade">Unidade</SelectItem>
                            <SelectItem value="porção">Porção</SelectItem>
                            <SelectItem value="fatia">Fatia</SelectItem>
                            <SelectItem value="bolo">Bolo</SelectItem>
                            <SelectItem value="litro">Litro</SelectItem>
                            <SelectItem value="kg">Quilograma</SelectItem>
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
