import { useEffect, useMemo, useState } from "react";
import {
  getReviewStats,
  submitReview,
  TAG_OPTIONS,
} from "../lib/reviews";

type Props = {
  vespaId: string;
  vespaName: string;
};

export default function Reviews({ vespaId, vespaName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    recommends: number;
    tagsCount: Record<string, number>;
    latestComment?: string;
  }>({ total: 0, recommends: 0, tagsCount: {} });

  // form
  const [recommend, setRecommend] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const s = await getReviewStats(vespaId);
        if (mounted) setStats(s);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [vespaId]);

  const topTags = useMemo(() => {
    const entries = Object.entries(stats.tagsCount);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5);
  }, [stats.tagsCount]);

  const onToggleTag = (t: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(t)) return prev.filter((x) => x !== t);
      if (prev.length >= 3) return prev; // máx 3
      return [...prev, t];
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview({
      vespaId,
      recommend,
      tags: selectedTags,
      comment: comment.trim() || undefined,
      source: "web",
    });
    // reset y recarga stats
    setOpen(false);
    setSelectedTags([]);
    setComment("");
    const s = await getReviewStats(vespaId);
    setStats(s);
  };

  return (
    <div className="mt-3">
      {/* RESUMEN */}
      {loading ? (
        <div className="text-sm text-slate-500">Cargando reseñas…</div>
      ) : stats.total === 0 ? (
        <div className="text-sm text-slate-500">
          Aún no hay reseñas de {vespaName}.{" "}
          <button
            onClick={() => setOpen(true)}
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Sé el primero en dejar una
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">{stats.total}</span>{" "}
            valoraciones ·{" "}
            <span className="font-medium text-emerald-700">
              {Math.round((stats.recommends / Math.max(1, stats.total)) * 100)}%
            </span>{" "}
            recomienda
          </div>

          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, n]) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs"
                  title={`${n} menciones`}
                >
                  {tag} <span className="ml-1 text-emerald-600">({n})</span>
                </span>
              ))}
            </div>
          )}

          {stats.latestComment && (
            <div className="text-sm italic text-slate-600">
              “{stats.latestComment}”
            </div>
          )}

          <div>
            <button
              onClick={() => setOpen(true)}
              className="text-sm rounded-md bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-slate-700"
            >
              Valorar esta Vespa
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 text-base">
                Valorar a <span className="text-emerald-700">{vespaName}</span>
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-sm"
              >
                Cerrar
              </button>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Recomienda */}
              <div className="text-sm">
                <div className="font-medium text-slate-700 mb-1">
                  ¿La recomendarías?
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setRecommend(true)}
                    className={`px-3 py-1.5 text-sm ${
                      recommend
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommend(false)}
                    className={`px-3 py-1.5 text-sm ${
                      !recommend
                        ? "bg-rose-600 text-white"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="text-sm">
                <div className="font-medium text-slate-700 mb-1">
                  Elige hasta 3 etiquetas:
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((t) => {
                    const active = selectedTags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => onToggleTag(t)}
                        className={`px-2.5 py-1 rounded-full border text-xs ${
                          active
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comentario */}
              <div className="text-sm">
                <label className="font-medium text-slate-700 mb-1 block">
                  Comentario (opcional)
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-300 focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos algo breve de tu experiencia"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-sm text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-sm text-white"
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
