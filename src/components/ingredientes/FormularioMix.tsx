
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useIngredientes } from '@/hooks/useIngredientes';
import { useMixes } from '@/hooks/useMixes';
import { NovoMixFormData } from '@/types/mix';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  nome: z.string().min(2, 'Nome do mix é obrigatório'),
  ingredientes: z.array(z.object({
    ingredienteId: z.string().min(1, 'Ingrediente é obrigatório'),
    quantidade: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
    unidade: z.string().min(1, 'Unidade é obrigatória'),
  })).min(1, 'Deve ter pelo menos um ingrediente'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  peso_total: z.string().min(1, 'Peso total é obrigatório'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  descricao: z.string().optional(),
});

interface FormularioMixProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const FormularioMix: React.FC<FormularioMixProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const { ingredientes, categorias } = useIngredientes();
  const { criarMix, verificarNomeDuplicado } = useMixes();
  const [salvando, setSalvando] = useState(false);

  const form = useForm<NovoMixFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      ingredientes: [{ ingredienteId: '', quantidade: 0, unidade: 'kg' }],
      categoria: '',
      peso_total: '',
      unidade: 'kg',
      descricao: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredientes"
  });

  const onSubmit = async (dados: NovoMixFormData) => {
    setSalvando(true);
    
    try {
      console.log('🔄 Criando novo mix:', dados);
      
      // Verificar duplicata
      if (verificarNomeDuplicado(dados.nome)) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Já existe um mix com este nome.",
        });
        return;
      }

      await criarMix(dados);
      
      toast({
        title: "Sucesso",
        description: "Mix cadastrado com sucesso!",
      });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('❌ Erro ao salvar mix:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao cadastrar mix.",
      });
    } finally {
      setSalvando(false);
    }
  };

  const adicionarIngrediente = () => {
    append({ ingredienteId: '', quantidade: 0, unidade: 'kg' });
  };

  const removerIngrediente = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-heading text-center">
          Cadastrar Mix de Ingredientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações básicas do mix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Mix</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mix de Farinhas" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-gray-800 z-50 border border-gray-300 dark:border-gray-600">
                        {categorias.map((categoria) => (
                          <SelectItem 
                            key={categoria} 
                            value={categoria}
                            className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peso_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Total</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1.0" {...field} />
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
            </div>

            {/* Lista de ingredientes */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Ingredientes do Mix</h3>
                <Button type="button" onClick={adicionarIngrediente} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Ingrediente
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`ingredientes.${index}.ingredienteId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingrediente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 z-50">
                            {ingredientes.filter(ing => ing.ativo).map((ingrediente) => (
                              <SelectItem 
                                key={ingrediente.id} 
                                value={ingrediente.id}
                                className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {ingrediente.alimento}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredientes.${index}.quantidade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade</FormLabel>
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

                  <FormField
                    control={form.control}
                    name={`ingredientes.${index}.unidade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removerIngrediente(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o mix de ingredientes..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1" disabled={salvando}>
                {salvando ? 'Cadastrando...' : 'Cadastrar Mix'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={salvando}>
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
