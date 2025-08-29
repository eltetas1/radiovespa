import { Link } from "react-router-dom";

const PoliticaCookies = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl mt-6 mb-10 text-slate-800 text-[15px] leading-relaxed">
      <h1 className="text-xl font-bold mb-4 text-slate-900">Política de Cookies</h1>

      <p className="mb-4">
        En <strong>radiovespa-ceuta.es</strong> utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación,
        analizar el uso de la web y ofrecerte contenido adaptado a tus intereses.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2 text-slate-800">¿Qué son las cookies?</h2>
      <p className="mb-4">
        Una cookie es un pequeño archivo que se almacena en tu dispositivo al visitar determinadas páginas web.
        Sirve para reconocer tu navegador, recordar preferencias o recopilar datos estadísticos.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2 text-slate-800">¿Qué tipos de cookies utilizamos?</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
          <strong>Cookies técnicas:</strong> necesarias para el correcto funcionamiento del sitio web.
        </li>
        <li>
          <strong>Cookies analíticas:</strong> como Google Analytics.
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2 text-slate-800">¿Cómo puedes gestionarlas?</h2>
      <p className="mb-4">
        Puedes aceptar o rechazar el uso de cookies desde el banner. También puedes gestionarlas desde la configuración de tu navegador.
      </p>

      <p className="text-sm text-slate-500 mb-6">Última actualización: agosto de 2025</p>

      {/* Botón centrado */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default PoliticaCookies;
