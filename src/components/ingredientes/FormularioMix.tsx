
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIngredientes } from '@/hooks/useIngredientes';
import { useMixes } from '@/hooks/useMixes';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Package } from 'lucide-react';
import { MixIngrediente, Mix } from '@/types/mix';

interface FormularioMixProps {
  mix?: Mix | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

const FormularioMix: React.FC<FormularioMixProps> = ({ mix, onCancel, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<MixIngrediente[]>([]);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);

  const { ingredientes, recarregarIngredientes } = useIngredientes();
  const { criarMix } = useMixes();
  const { toast } = useToast();

  useEffect(() => {
    recarregarIngredientes();
    
    // Se há um mix para editar, preencher os campos
    if (mix) {
      setNome(mix.nome);
      setIngredientesSelecionados(mix.ingredientes);
    }
  }, [mix]);

  const adicionarIngrediente = () => {
    if (!ingredienteSelecionado || quantidade <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um ingrediente e uma quantidade válida.",
      });
      return;
    }

    const jaExiste = ingredientesSelecionados.find(
      item => (typeof item.ingredienteId === 'string' ? item.ingredienteId : item.ingredienteId.id) === ingredienteSelecionado
    );

    if (jaExiste) {
      toast({
        variant: "destructive",
        title: "Ingrediente já adicionado",
        description: "Este ingrediente já foi adicionado ao mix.",
      });
      return;
    }

    // Encontrar o ingrediente para pegar sua unidade
    const ingredienteEncontrado = ingredientes.find(ing => (ing.id || ing._id) === ingredienteSelecionado);
    const unidadeIngrediente = ingredienteEncontrado?.unidade || 'un';

    const novoIngrediente: MixIngrediente = {
      ingredienteId: ingredienteSelecionado,
      quantidade,
      unidade: unidadeIngrediente
    };

    setIngredientesSelecionados([...ingredientesSelecionados, novoIngrediente]);
    setIngredienteSelecionado('');
    setQuantidade(1);
  };

  const removerIngrediente = (ingredienteId: string) => {
    setIngredientesSelecionados(
      ingredientesSelecionados.filter(item => {
        const id = typeof item.ingredienteId === 'string' ? item.ingredienteId : item.ingredienteId.id;
        return id !== ingredienteId;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nome do mix é obrigatório.",
      });
      return;
    }

    if (ingredientesSelecionados.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Adicione pelo menos um ingrediente ao mix.",
      });
      return;
    }

    setLoading(true);
    try {
      await criarMix({
        nome,
        ingredientes: ingredientesSelecionados,
        categoria: 'Mix',
        peso_total: '1.0',
        unidade: 'un'
      });

      toast({
        title: "Mix criado!",
        description: "O mix foi cadastrado com sucesso.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        onCancel();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar mix",
        description: "Não foi possível criar o mix. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIngredienteNome = (id: string) => {
    const ingrediente = ingredientes.find(ing => ing.id === id || ing._id === id);
    return ingrediente?.alimento || 'Ingrediente não encontrado';
  };

  // Ordenar ingredientes alfabeticamente por nome
  const ingredientesOrdenados = [...ingredientes].sort((a, b) => 
    a.alimento.localeCompare(b.alimento, 'pt-BR', { sensitivity: 'base' })
  );

  const ingredienteSelecionadoData = ingredientes.find(ing => 
    (ing.id || ing._id) === ingredienteSelecionado
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Cadastrar Mix de Ingredientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Mix *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Mix de Farinhas"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Ingredientes do Mix</Label>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="justify-between w-full"
                    >
                      {ingredienteSelecionadoData
                        ? `${ingredienteSelecionadoData.alimento} (${ingredienteSelecionadoData.unidade})`
                        : "Selecione um ingrediente..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar ingrediente..." />
                      <CommandList>
                        <CommandEmpty>Nenhum ingrediente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {ingredientesOrdenados.map((ingrediente) => (
                            <CommandItem
                              key={ingrediente.id || ingrediente._id}
                              value={`${ingrediente.alimento} ${ingrediente.unidade}`}
                              onSelect={() => {
                                setIngredienteSelecionado(ingrediente.id || ingrediente._id || '');
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  ingredienteSelecionado === (ingrediente.id || ingrediente._id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {ingrediente.alimento} ({ingrediente.unidade})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="w-24">
                <Input
                  type="number"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  placeholder="Qtd"
                  min="1"
                  step="0.1"
                />
              </div>
              
              <Button
                type="button"
                onClick={adicionarIngrediente}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {ingredientesSelecionados.length > 0 && (
              <div className="space-y-2">
                <Label>Ingredientes Selecionados:</Label>
                <div className="flex flex-wrap gap-2">
                  {ingredientesSelecionados.map((item, index) => {
                    const ingredienteId = typeof item.ingredienteId === 'string' ? item.ingredienteId : item.ingredienteId.id;
                    return (
                      <Badge
                        key={`${ingredienteId}-${index}`}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        {getIngredienteNome(ingredienteId)} ({item.quantidade} {item.unidade})
                        <button
                          type="button"
                          onClick={() => removerIngrediente(ingredienteId)}
                          className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Mix'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormularioMix;
