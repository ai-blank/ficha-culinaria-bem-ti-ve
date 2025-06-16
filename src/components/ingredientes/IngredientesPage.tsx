
import React, { useState } from 'react';
import { FormularioIngrediente } from './FormularioIngrediente';
import { ListaIngredientes } from './ListaIngredientes';
import { Ingrediente } from '@/types/ingrediente';

export const IngredientesPage: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<Ingrediente | null>(null);

  const handleNovoIngrediente = () => {
    setIngredienteEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditarIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteEditando(ingrediente);
    setMostrarFormulario(true);
  };

  const handleSuccesso = () => {
    setMostrarFormulario(false);
    setIngredienteEditando(null);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setIngredienteEditando(null);
  };

  if (mostrarFormulario) {
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

  return (
    <div className="container mx-auto p-6">
      <ListaIngredientes
        onNovoIngrediente={handleNovoIngrediente}
        onEditarIngrediente={handleEditarIngrediente}
      />
    </div>
  );
};
