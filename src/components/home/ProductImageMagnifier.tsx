"use client";

import { useCallback, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ZOOM = 2.65;
const LENS_PX = 88;

interface ProductImageMagnifierProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Vista tipo Mercado Libre: en desktop, panel derecho con zoom siguiendo el cursor;
 * en móvil, botón lupa para pantalla completa.
 */
export function ProductImageMagnifier({ src, alt, className }: ProductImageMagnifierProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setPos({ x, y });
  }, []);

  return (
    <>
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-stretch gap-2 md:gap-0 w-full h-full",
          className
        )}
      >
        {/* Zona principal + lente (desktop: columna izquierda) */}
        <div
          ref={wrapRef}
          className="relative flex-1 min-h-[160px] md:min-h-[280px] md:flex-[1.15] overflow-hidden rounded-xl md:rounded-l-xl md:rounded-r-none bg-gray-50/80 cursor-crosshair touch-none"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onMouseMove={onMove}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />

          {hover && (
            <div
              className="hidden md:block absolute pointer-events-none rounded-md border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] bg-white/15 backdrop-blur-[1px]"
              style={{
                width: LENS_PX,
                height: LENS_PX,
                left: `calc(${pos.x}% - ${LENS_PX / 2}px)`,
                top: `calc(${pos.y}% - ${LENS_PX / 2}px)`,
              }}
            />
          )}

          <button
            type="button"
            className="md:hidden absolute bottom-2 right-2 z-10 flex items-center justify-center p-2.5 bg-white rounded-full shadow-lg border border-gray-100 active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setFullOpen(true);
            }}
            aria-label="Ampliar imagen"
          >
            <Search className="w-5 h-5 text-btn-blue" strokeWidth={2.5} />
          </button>

          <span className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-gray-500 shadow border border-gray-100/90 pointer-events-none whitespace-nowrap">
            <Search className="w-3 h-3 text-btn-blue shrink-0" />
            Mueve el cursor sobre la foto
          </span>
        </div>

        {/* Panel zoom — solo desktop (columna derecha del bloque imagen) */}
        <div className="hidden md:flex flex-col flex-[0.85] min-w-[min(40%,220px)] max-w-[300px] border-l border-gray-200/90 bg-gray-50/50 shrink-0">
          <div className="px-2 py-1.5 text-center border-b border-gray-200/80 bg-white/70">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Vista ampliada</span>
          </div>
          <div
            className="relative flex-1 min-h-[220px] overflow-hidden rounded-br-xl bg-gray-100"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${ZOOM * 100}%`,
              backgroundPosition: `${pos.x}% ${pos.y}%`,
            }}
            aria-hidden
          />
        </div>
      </div>

      {/* Vista ampliada móvil */}
      {fullOpen && (
        <div
          className="fixed inset-0 z-[600] flex flex-col bg-black/95 animate-in fade-in duration-200"
          role="dialog"
          aria-modal
          aria-label="Imagen ampliada"
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
          >
            <p className="text-white/90 text-xs font-bold uppercase tracking-widest">Vista ampliada</p>
            <button
              type="button"
              onClick={() => setFullOpen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Cerrar vista ampliada"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-auto pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={() => setFullOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[min(85dvh,85svh)] w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
