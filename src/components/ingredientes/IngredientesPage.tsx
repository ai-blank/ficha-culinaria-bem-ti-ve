
import React, { useState } from 'react';
import { FormularioIngrediente } from './FormularioIngrediente';
import FormularioMix from './FormularioMix';
import { ListaIngredientes } from './ListaIngredientes';
import { Ingrediente } from '@/types/ingrediente';

type ModoExibicao = 'lista' | 'ingrediente' | 'mix';

export const IngredientesPage: React.FC = () => {
  const [modo, setModo] = useState<ModoExibicao>('lista');
  const [ingredienteEditando, setIngredienteEditando] = useState<Ingrediente | null>(null);

  const handleNovoIngrediente = () => {
    setIngredienteEditando(null);
    setModo('ingrediente');
  };

  const handleNovoMix = () => {
    setModo('mix');
  };

  const handleEditarIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteEditando(ingrediente);
    setModo('ingrediente');
  };

  const handleSuccesso = () => {
    setModo('lista');
    setIngredienteEditando(null);
  };

  const handleCancelar = () => {
    setModo('lista');
    setIngredienteEditando(null);
  };

  if (modo === 'ingrediente') {
    return (
      <div className="container mx-auto p-6">
        <FormularioIngrediente
          ingrediente={ingredienteEditando}
          onSuccess={handleSuccesso}
          onCancel={handleCancelar}
        />
      </div>
    );
  }

  if (modo === 'mix') {
    return (
      <div className="container mx-auto p-6">
        <FormularioMix
          onCancel={handleCancelar}
          onSuccess={handleSuccesso}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ListaIngredientes
        onNovoIngrediente={handleNovoIngrediente}
        onNovoMix={handleNovoMix}
        onEditarIngrediente={handleEditarIngrediente}
      />
    </div>
  );
};
