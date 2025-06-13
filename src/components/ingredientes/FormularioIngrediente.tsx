
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIngredientes } from '@/hooks/useIngredientes';
import { NovoIngredienteFormData } from '@/types/ingrediente';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  alimento: z.string().min(2, 'Nome do alimento é obrigatório'),
  peso: z.number().min(0.01, 'Peso deve ser maior que 0'),
  preco: z.number().min(0.01, 'Preço deve ser maior que 0'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  fator_correcao: z.number().min(0.1, 'Fator de correção deve ser maior que 0'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  quantidade_estoque: z.number().optional(),
  data_validade: z.string().optional(),
  fornecedor: z.string().optional(),
});

interface FormularioIngredienteProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FormularioIngrediente: React.FC<FormularioIngredienteProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const {
    categorias,
    fatoresCorrecao,
    criarIngrediente,
    verificarNomeDuplicado,
    extrairUnidade,
    buscarFatorCorrecao,
  } = useIngredientes();

  const [alimentoSelecionado, setAlimentoSelecionado] = useState('');

  const form = useForm<NovoIngredienteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      alimento: '',
      peso: 0,
      preco: 0,
      unidade: '',
      fator_correcao: 1.0,
      categoria: '',
      quantidade_estoque: undefined,
      data_validade: '',
      fornecedor: '',
    },
  });

  // Auto-preenchimento baseado no alimento selecionado
  useEffect(() => {
    if (alimentoSelecionado) {
      const { alimento, unidade } = extrairUnidade(alimentoSelecionado);
      const fatorCorrecao = buscarFatorCorrecao(alimento);
      
      form.setValue('alimento', alimento);
      form.setValue('unidade', unidade);
      form.setValue('fator_correcao', fatorCorrecao);
    }
  }, [alimentoSelecionado, form, extrairUnidade, buscarFatorCorrecao]);

  const onSubmit = (dados: NovoIngredienteFormData) => {
    if (verificarNomeDuplicado(dados.alimento)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Já existe um ingrediente com este nome.",
      });
      return;
    }

    try {
      criarIngrediente(dados);
      toast({
        title: "Sucesso",
        description: "Ingrediente cadastrado com sucesso!",
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao cadastrar ingrediente.",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-center">
          Cadastrar Novo Ingrediente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção rápida baseada na tabela */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Buscar na base de dados (opcional)
              </label>
              <Select onValueChange={setAlimentoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um alimento da base..." />
                </SelectTrigger>
                <SelectContent>
                  {fatoresCorrecao.map((item, index) => (
                    <SelectItem key={index} value={item.alimento}>
                      {item.alimento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="alimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Alimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Tomate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso/Quantidade</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1.0"
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
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="un">un</SelectItem>
                        <SelectItem value="dz">dz</SelectItem>
                        <SelectItem value="pct">pct</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fator_correcao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fator de Correção</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos opcionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantidade_estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_validade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade (opcional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fornecedor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1">
                Cadastrar Ingrediente
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
