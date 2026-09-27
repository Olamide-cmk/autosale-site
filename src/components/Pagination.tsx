import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/i18n/locale-context";

export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  const { t } = useLocale();
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex size-9 items-center justify-center rounded-md border text-sm disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("pagination.prev")}
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1 text-muted-foreground">…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex size-9 items-center justify-center rounded-md border text-sm font-semibold ${
                p === page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="inline-flex size-9 items-center justify-center rounded-md border text-sm disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={t("pagination.next")}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
