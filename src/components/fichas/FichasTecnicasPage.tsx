
import React, { useState } from 'react';
import { FormularioFichaTecnica } from './FormularioFichaTecnica';
import { ListaFichasTecnicas } from './ListaFichasTecnicas';
import { FichaTecnica } from '@/types/ficha-tecnica';

export const FichasTecnicasPage: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [fichaEditando, setFichaEditando] = useState<FichaTecnica | null>(null);

  const handleNovaFicha = () => {
    setFichaEditando(null);
    setMostrarFormulario(true);
  };

  const handleEditarFicha = (ficha: FichaTecnica) => {
    setFichaEditando(ficha);
    setMostrarFormulario(true);
  };

  const handleSuccesso = () => {
    setMostrarFormulario(false);
    setFichaEditando(null);
  };

  const handleCancelar = () => {
    setMostrarFormulario(false);
    setFichaEditando(null);
  };

  if (mostrarFormulario) {
    return (
      <div className="container mx-auto p-6">
        <FormularioFichaTecnica
          fichaTecnica={fichaEditando}
          onSuccess={handleSuccesso}
          onCancel={handleCancelar}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <ListaFichasTecnicas
        onNovaFicha={handleNovaFicha}
        onEditarFicha={handleEditarFicha}
      />
    </div>
  );
};
