
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useIngredientes } from '@/hooks/useIngredientes';
import { useMixes } from '@/hooks/useMixes';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Package } from 'lucide-react';

interface FormularioMixProps {
  onCancel: () => void;
}

const FormularioMix: React.FC<FormularioMixProps> = ({ onCancel }) => {
  const [nome, setNome] = useState('');
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<Array<{
    ingredienteId: string;
    quantidade: number;
  }>>([]);
  const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const { ingredientes, carregarIngredientes } = useIngredientes();
  const { criarMix } = useMixes();
  const { toast } = useToast();

  useEffect(() => {
    carregarIngredientes();
  }, [carregarIngredientes]);

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
      item => item.ingredienteId === ingredienteSelecionado
    );

    if (jaExiste) {
      toast({
        variant: "destructive",
        title: "Ingrediente já adicionado",
        description: "Este ingrediente já foi adicionado ao mix.",
      });
      return;
    }

    setIngredientesSelecionados([
      ...ingredientesSelecionados,
      { ingredienteId: ingredienteSelecionado, quantidade }
    ]);

    setIngredienteSelecionado('');
    setQuantidade(1);
  };

  const removerIngrediente = (ingredienteId: string) => {
    setIngredientesSelecionados(
      ingredientesSelecionados.filter(item => item.ingredienteId !== ingredienteId)
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
        ingredientes: ingredientesSelecionados
      });

      toast({
        title: "Mix criado!",
        description: "O mix foi cadastrado com sucesso.",
      });

      onCancel();
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
                <Select value={ingredienteSelecionado} onValueChange={setIngredienteSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ingrediente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientes.map((ingrediente) => (
                      <SelectItem 
                        key={ingrediente.id || ingrediente._id} 
                        value={ingrediente.id || ingrediente._id || ''}
                      >
                        {ingrediente.alimento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {ingredientesSelecionados.map((item) => (
                    <Badge
                      key={item.ingredienteId}
                      variant="secondary"
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {getIngredienteNome(item.ingredienteId)} ({item.quantidade})
                      <button
                        type="button"
                        onClick={() => removerIngrediente(item.ingredienteId)}
                        className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
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
