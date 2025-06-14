
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Plus, Copy, Calculator } from 'lucide-react';
import { useFichasTecnicas } from '@/hooks/useFichasTecnicas';
import { FichaTecnica } from '@/types/ficha-tecnica';
import { useToast } from '@/hooks/use-toast';

interface ListaFichasTecnicasProps {
  onNovaFicha?: () => void;
  onEditarFicha?: (ficha: FichaTecnica) => void;
}

export const ListaFichasTecnicas: React.FC<ListaFichasTecnicasProps> = ({
  onNovaFicha,
  onEditarFicha,
}) => {
  const { toast } = useToast();
  const { fichasTecnicas, atualizarFichaTecnica, clonarFichaTecnica } = useFichasTecnicas();
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'custo' | 'data'>('nome');

  const fichasFiltradas = fichasTecnicas
    .filter((ficha) =>
      ficha.nome_receita.toLowerCase().includes(busca.toLowerCase())
    )
    .sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome_receita.localeCompare(b.nome_receita);
        case 'custo':
          return (a.custo_total || 0) - (b.custo_total || 0);
        case 'data':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

  const alternarStatus = (id: string, ativo: boolean) => {
    atualizarFichaTecnica(id, { ativo: !ativo });
    toast({
      title: ativo ? "Ficha desativada" : "Ficha reativada",
      description: `A ficha técnica foi ${ativo ? 'desativada' : 'reativada'} com sucesso.`,
    });
  };

  const clonarFicha = (ficha: FichaTecnica) => {
    try {
      clonarFichaTecnica(ficha);
      toast({
        title: "Ficha clonada!",
        description: "Uma cópia da ficha técnica foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao clonar a ficha técnica.",
      });
    }
  };

  const formatarMoeda = (valor?: number) => {
    if (valor === undefined) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-heading flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Fichas Técnicas
          </CardTitle>
          <Button onClick={onNovaFicha} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Ficha Técnica
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controles de busca e ordenação */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar fichas técnicas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={ordenacao === 'nome' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrdenacao('nome')}
            >
              Nome
            </Button>
            <Button
              variant={ordenacao === 'custo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrdenacao('custo')}
            >
              Custo
            </Button>
            <Button
              variant={ordenacao === 'data' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOrdenacao('data')}
            >
              Data
            </Button>
          </div>
        </div>

        {/* Tabela de fichas técnicas */}
        {fichasFiltradas.length === 0 ? (
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {busca ? 'Nenhuma ficha técnica encontrada.' : 'Nenhuma ficha técnica cadastrada.'}
            </p>
            {!busca && (
              <Button onClick={onNovaFicha} className="mt-4">
                Criar primeira ficha técnica
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Nome da Receita</TableHead>
                  <TableHead>Rendimento</TableHead>
                  <TableHead>Custo Total</TableHead>
                  <TableHead>Custo por Unidade</TableHead>
                  <TableHead>Preço Sugerido</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Atualizada em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fichasFiltradas.map((ficha) => (
                  <TableRow key={ficha.id}>
                    <TableCell>
                      <Badge variant={ficha.ativo ? 'default' : 'secondary'}>
                        {ficha.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ficha.nome_receita}
                    </TableCell>
                    <TableCell>
                      {ficha.rendimento} {ficha.unidade_rendimento}
                    </TableCell>
                    <TableCell>{formatarMoeda(ficha.custo_total)}</TableCell>
                    <TableCell>{formatarMoeda(ficha.custo_por_unidade)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatarMoeda(ficha.preco_venda_sugerido)}
                    </TableCell>
                    <TableCell>{ficha.margem_lucro}%</TableCell>
                    <TableCell>{formatarData(ficha.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditarFicha?.(ficha)}
                          title="Editar ficha"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clonarFicha(ficha)}
                          title="Clonar ficha"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant={ficha.ativo ? "destructive" : "default"}
                          size="sm"
                          onClick={() => alternarStatus(ficha.id, ficha.ativo)}
                          title={ficha.ativo ? "Desativar" : "Reativar"}
                        >
                          {ficha.ativo ? (
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
      </CardContent>
    </Card>
  );
};
