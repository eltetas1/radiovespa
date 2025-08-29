import type { FC } from "react";

type Vespa = {
  id: string;
  nombre: string;
  telefono: string;
};

interface Props {
  vespas: Vespa[];
}

const VespasList: FC<Props> = ({ vespas }) => {
  const handleContact = (vespa: Vespa) => {
    // 1. Avisar al Google Script
    fetch(`https://script.google.com/macros/s/AKfycbzh_msM_9_spBa14B_ZfVldpfjNuufDwMFdXUvX9Wmskxma2rBSidR2Y4jyaCoFLgDHrQ/exec?id=${vespa.id}`).catch(() => {});

    // 2. Redirigir a WhatsApp
    window.location.href = `https://wa.me/${vespa.telefono}`;
  };

  return (
    <div className="grid gap-4">
      {vespas.map((vespa) => (
        <div key={vespa.id} className="p-4 shadow rounded-xl border">
          <h3 className="font-bold">{vespa.nombre}</h3>
          <p>{vespa.telefono}</p>
          <button
            onClick={() => handleContact(vespa)}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
          >
            Contactar
          </button>
        </div>
      ))}
    </div>
  );
};

export default VespasList;
