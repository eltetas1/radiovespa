import { useEffect, useMemo, useState, useRef, useDeferredValue } from "react";
import { loadVespas, Vespa, Tamano } from "./lib/data";
import { Zap, MapPin, Clock, Package } from "lucide-react";
import CookieBanner from "./components/CookieBanner";
import GeoBlocker from "./components/GeoBlocker";
import { getReviewStats, type ReviewStats } from "./lib/reviews";
import { uniq, norm, waLinkWithText, topTags, seededShuffle, dailySeed } from "./lib/utils";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyveLabAQw4vpA7dJ74_M1K_7oKP22uHuaqgOd8y-H0X2eUxxHNdfguJVgkJHSP6X18Uw/exec";

function RecommendPill({ stats }: { stats?: ReviewStats }) {
  if (!stats || stats.total === 0) return null;
  const pct = Math.round((stats.recommends / stats.total) * 100);
  return (
    <span className="pill-verified">
      ✅ {pct}% la recomiendan ({stats.total})
    </span>
  );
}

function LazyStats({
  id,
  loaded,
  onLoaded,
}: {
  id: string;
  loaded: boolean;
  onLoaded: (id: string, stats: ReviewStats) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (loaded) return;
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (e) => {
          if (e.isIntersecting) {
            io.disconnect();
            try {
              const st = await getReviewStats(id);
              if (!cancelled) onLoaded(id, st);
            } catch (err) {
              console.error("Error cargando stats (lazy) para", id, err);
              if (!cancelled) onLoaded(id, { total: 0, recommends: 0, tagsCount: {} } as ReviewStats);
            }
          }
        });
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [id, loaded, onLoaded]);
  return <div ref={ref} aria-hidden="true" />;
}

type Servicio = string;

export default function App() {
  const [all, setAll] = useState<Vespa[]>([]);
  const [servicio, setServicio] = useState<Servicio | "">("");
  const [tamano, setTamano] = useState<Tamano | "">("");
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [statsMap, setStatsMap] = useState<Record<string, ReviewStats>>({});
  const [loadingVespas, setLoadingVespas] = useState(true);
  const lastClickRef = useRef<Record<string, number>>({});


  useEffect(() => {
    let isMounted = true;
    setLoadingVespas(true);
    (async () => {
      try {
        const v = await loadVespas();
        const visibles = v.filter((x) => x.visible !== false);
        const mezclados = seededShuffle(visibles);
        if (isMounted) setAll(mezclados);
      } catch (err) {
        console.error("Error cargando vespas:", err);
        if (isMounted) setAll([]);
      } finally {
        if (isMounted) setLoadingVespas(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setStatsMap({});
  }, [all]);

  const servicios = useMemo(
    () =>
      uniq(
        all.flatMap((v) => v.servicios.map((s) => s.trim()).filter(Boolean))
      ).sort(),
    [all]
  );

  const list = useMemo(() => {
    const k = norm(dq);
    const filtered = all
      .filter((v) => (servicio ? v.servicios.some((s) => s.trim() === servicio) : true))
      .filter((v) => (tamano ? v.tamano === tamano : true))
      .filter((v) =>
        k ? [v.nombre, v.notas || "", ...(v.etiquetas || [])].join(" ").toLowerCase().includes(k) : true
      );
    const destacados = filtered.filter((v) => v.destacado);
    const resto = filtered.filter((v) => !v.destacado);
    return [...destacados, ...resto];
  }, [all, servicio, tamano, dq]);

  function handleWhatsappClick(v: Vespa) {
    const now = Date.now();
    if (now - (lastClickRef.current[v.id] || 0) < 800) return; // evita doble clic rápido
    lastClickRef.current[v.id] = now;

    // 1. Sumar en Google Sheets
    fetch(`${SCRIPT_URL}?id=${encodeURIComponent(v.id)}`, {
      method: "GET",
      mode: "no-cors",
      keepalive: true,
    }).catch(() => {});

    // 2. Abrir WhatsApp
    window.open(
      waLinkWithText(
        v.telefono,
        `Hola 👋, vengo de RadioVespa. Quisiera contactar con *${v.nombre}*. ¿Está disponible?`
      ),
      "_blank"
    );
  }


  return (
    <>
      <GeoBlocker />

      <div className="container-app">
        <div className="header">
          <div className="header-inner">
            <img
              src="/camion-verde.png"
              alt="Logo"
              width="32"
              height="32"
              decoding="async"
              className="logo-img"
            />
            <div className="title-wrap">
              <div className="title">RadioVespa</div>
              <div className="subtitle">Transporte rápido en Ceuta</div>
            </div>
          </div>
        </div>

        <div className="subheader">{list.length} Vespas disponibles</div>

        <div className="promo-banner">
          <h2 className="promo-title">🚚 ¿Eres una Vespa en Ceuta?</h2>
          <p className="promo-text">
            Únete a RadioVespa y empieza a recibir llamadas directas de gente que necesita transporte.
            <br />
            Sin apps, sin registros, solo visibilidad y más trabajo.
          </p>
          <a
            href="https://wa.me/212690960049?text=vespa123"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-promo"
          >
            💬 Contactar por WhatsApp
          </a>
        </div>

        <div className="filters">
          <label htmlFor="servicio" className="sr-only">Servicio</label>
          <select
            id="servicio"
            value={servicio}
            onChange={(e) => setServicio(e.target.value as Servicio | "")}
            className="input"
          >
            <option value="">Servicio</option>
            {servicios.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label htmlFor="tamano" className="sr-only">Tamaño</label>
          <select
            id="tamano"
            value={tamano}
            onChange={(e) => setTamano(e.target.value as Tamano | "")}
            className="input"
          >
            <option value="">Tamaño</option>
            <option value="pequeña">pequeña</option>
            <option value="mediana">mediana</option>
            <option value="grande">grande</option>
          </select>

          <div className="input-col-2">
            <label htmlFor="search" className="sr-only">Buscar</label>
            <input
              id="search"
              className="input"
              placeholder="Buscar por nombre o notas"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="order-text">Orden rotativo diario</div>

        {loadingVespas && list.length === 0 ? (
          <div className="list">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-line skeleton-line--wide mb-2"></div>
                <div className="skeleton-line skeleton-line--sm skeleton-line--half mb-3"></div>
                <div className="flex items-center gap-2">
                  <div className="skeleton-chip"></div>
                  <div className="skeleton-chip skeleton-chip--md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="list">
            {list.map((v) => {
              const stats = statsMap[v.id];
              const tags = topTags(stats);
              return (
                <article
                  key={v.id}
                  className={`card ${v.destacado ? "card--featured" : "card--normal"}`}
                >
                  <div className="card-row">
                    <div>
                      <div className="card-title">{v.nombre}</div>
                      <div className="row-top">
                        <span className="pill-verified">
                          <Zap className="icon-14" />
                          {v.trabajosVerificados} trabajos verificados
                        </span>
                        {stats === undefined ? (
                          <span className="skeleton-pill">···</span>
                        ) : (
                          <RecommendPill stats={stats} />
                        )}
                        <LazyStats
                          id={v.id}
                          loaded={!!stats}
                          onLoaded={(id, st) =>
                            setStatsMap((prev) => ({ ...prev, [id]: st }))
                          }
                        />
                        <div className="chips">
                          {v.servicios.map((s) => (
                            <span key={s} className="chip-service">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="meta">
                        <span className="inline-flex items-center gap-1">
                          <Package className="icon-16 icon-muted" />
                          {v.tamano}
                        </span>
                        <span className="meta-sep">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="icon-16 icon-muted" />
                          {v.horario}
                        </span>
                        {v.zonas.length > 0 && (
                          <>
                            <span className="meta-sep">·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="icon-16 icon-muted" />
                              {v.zonas.join(", ")}
                            </span>
                          </>
                        )}
                      </div>

                      {!!tags.length && (
                        <div className="tags">
                          {tags.map((tag) => (
                            <span key={tag} className="chip-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {v.notas ? <p className="note">“{v.notas}”</p> : null}
                    </div>

<div className="cta">
  <button onClick={() => handleWhatsappClick(v)} className="btn-whatsapp">
    WhatsApp
  </button>
</div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

        <CookieBanner />
      </div>
    </>
  );
}