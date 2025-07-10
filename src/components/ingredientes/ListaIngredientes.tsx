import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useIngredientes } from '@/hooks/useIngredientes';
import { Ingrediente } from '@/types/ingrediente';

interface ListaIngredientesProps {
  onNovoIngrediente: () => void;
  onNovoMix: () => void;
  onEditarIngrediente: (ingrediente: Ingrediente) => void;
}

export const ListaIngredientes: React.FC<ListaIngredientesProps> = ({
  onNovoIngrediente,
  onNovoMix,
  onEditarIngrediente,
}) => {
  const { ingredientes, atualizarIngrediente } = useIngredientes();
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'categoria' | 'preco'>('nome');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc');

  const ingredientesFiltrados = ingredientes
    .filter((ingrediente) =>
      ingrediente.alimento.toLowerCase().includes(busca.toLowerCase()) ||
      ingrediente.categoria.toLowerCase().includes(busca.toLowerCase()) ||
      ingrediente.fornecedor?.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      let resultado = 0;
      
      switch (ordenacao) {
        case 'nome':
          resultado = a.alimento.localeCompare(b.alimento);
          break;
        case 'categoria':
          resultado = a.categoria.localeCompare(b.categoria);
          break;
        case 'preco':
          resultado = a.preco - b.preco;
          break;
        default:
          resultado = 0;
      }
      
      return direcaoOrdenacao === 'desc' ? -resultado : resultado;
    });

  const handleOrdenacao = (novaOrdenacao: 'nome' | 'categoria' | 'preco') => {
    if (ordenacao === novaOrdenacao) {
      // Se clicou na mesma ordenação, inverte a direção
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      // Se é uma nova ordenação, começa com ascendente
      setOrdenacao(novaOrdenacao);
      setDirecaoOrdenacao('asc');
    }
  };

  const getIconeOrdenacao = (tipoOrdenacao: 'nome' | 'categoria' | 'preco') => {
    if (ordenacao !== tipoOrdenacao) {
      return <ArrowUpDown className="w-3 h-3 ml-1" />;
    }
    return direcaoOrdenacao === 'asc' ? 
      <ArrowUp className="w-3 h-3 ml-1" /> : 
      <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const alternarStatus = (id: string, ativo: boolean) => {
    atualizarIngrediente(id, { ativo: !ativo });
  };

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  return (
    <div className="space-y-6">
      {/* Header com título e botões */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Ingredientes</h1>
          <p className="text-muted-foreground">Gerencie seus ingredientes e mixes</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onNovoMix} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Mix
          </Button>
          <Button onClick={onNovoIngrediente}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Ingrediente
          </Button>
        </div>
      </div>

      {/* Controles de busca e ordenação */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar ingredientes..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={ordenacao === 'nome' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleOrdenacao('nome')}
            className="flex items-center"
          >
            Nome
            {getIconeOrdenacao('nome')}
          </Button>
          <Button
            variant={ordenacao === 'categoria' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleOrdenacao('categoria')}
            className="flex items-center"
          >
            Categoria
            {getIconeOrdenacao('categoria')}
          </Button>
          <Button
            variant={ordenacao === 'preco' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleOrdenacao('preco')}
            className="flex items-center"
          >
            Preço
            {getIconeOrdenacao('preco')}
          </Button>
        </div>
      </div>

      {/* Tabela de ingredientes */}
      {ingredientesFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {busca ? 'Nenhum ingrediente encontrado.' : 'Nenhum ingrediente cadastrado.'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Alimento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Fator Correção</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientesFiltrados.map((ingrediente, index) => (
                <TableRow key={ingrediente.id || `ingrediente-${index}`}>
                  <TableCell>
                    <Badge variant={ingrediente.ativo ? 'default' : 'secondary'}>
                      {ingrediente.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {ingrediente.alimento}
                  </TableCell>
                  <TableCell>{ingrediente.categoria}</TableCell>
                  <TableCell>
                    {ingrediente.peso} {ingrediente.unidade}
                  </TableCell>
                  <TableCell>{formatarPreco(ingrediente.preco)}</TableCell>
                  <TableCell>{ingrediente.fator_correcao}</TableCell>
                  <TableCell>
                    {ingrediente.quantidade_estoque !== undefined
                      ? `${ingrediente.quantidade_estoque} ${ingrediente.unidade}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditarIngrediente?.(ingrediente)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={ingrediente.ativo ? "destructive" : "default"}
                        size="sm"
                        onClick={() => alternarStatus(ingrediente.id, ingrediente.ativo)}
                      >
                        {ingrediente.ativo ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
