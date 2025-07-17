
import React, { useState } from 'react';
import { FormularioIngrediente } from './FormularioIngrediente';
import FormularioMix from './FormularioMix';
import { ListaIngredientes } from './ListaIngredientes';
import { Ingrediente } from '@/types/ingrediente';
import { Mix } from '@/types/mix';

type ModoExibicao = 'lista' | 'ingrediente' | 'mix';

export const IngredientesPage: React.FC = () => {
  const [modo, setModo] = useState<ModoExibicao>('lista');
  const [ingredienteEditando, setIngredienteEditando] = useState<Ingrediente | null>(null);
  const [mixEditando, setMixEditando] = useState<Mix | null>(null);

  const handleNovoIngrediente = () => {
    setIngredienteEditando(null);
    setModo('ingrediente');
  };

  const handleNovoMix = () => {
    setMixEditando(null);
    setModo('mix');
  };

  const handleEditarIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteEditando(ingrediente);
    setModo('ingrediente');
  };

  const handleEditarMix = (mix: Mix) => {
    setMixEditando(mix);
    setModo('mix');
  };

  const handleSuccesso = () => {
    setModo('lista');
    setIngredienteEditando(null);
    setMixEditando(null);
  };

  const handleCancelar = () => {
    setModo('lista');
    setIngredienteEditando(null);
    setMixEditando(null);
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
          mix={mixEditando}
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
        onEditarMix={handleEditarMix}
      />
    </div>
  );
};
