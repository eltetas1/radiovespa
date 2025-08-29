// src/components/GeoBlocker.tsx
import { useEffect, useState } from "react";

export default function GeoBlocker() {
  const [bloqueado, setBloqueado] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const pais = data.country;
        const ip = data.ip;

        const esEspana = pais === "ES";
        const ipEspanola = ip?.startsWith("80.") || ip?.startsWith("81.") || ip?.startsWith("82.");

        if (!esEspana && !ipEspanola) {
          setBloqueado(true);
        }
      })
      .catch(() => {
        setBloqueado(false); // ⚠️ No bloqueamos si falla
      });
  }, []);

  if (bloqueado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-center px-4">
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-md max-w-md">
          <h1 className="text-2xl font-bold text-red-700 mb-3">Acceso restringido</h1>
          <p className="text-sm text-red-600">
            Esta aplicación solo está disponible para usuarios en <strong>España</strong>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
