"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, UploadSimple as Upload } from "@phosphor-icons/react/ssr";
import { uploadPropertyCover } from "../actions";

export function PropertyCoverUpload({
  propertyId,
  coverUrl,
}: {
  propertyId: string;
  coverUrl: string | null;
}) {
  const [url, setUrl] = useState(coverUrl);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadPropertyCover(propertyId, fd);
    setUploading(false);
    if (res.ok && res.url) setUrl(res.url);
    else setErr(res.error ?? "Erro no upload.");
  }

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ImageIcon className="size-4 text-foreground/60" />
        <h2 className="font-display text-lg font-bold tracking-tight">Foto de capa</h2>
      </div>
      <p className="mt-1 text-sm text-foreground/65">
        Aparece no card do imóvel e no tablet do hóspede.
      </p>

      {url ? (
        <div className="mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-border/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="mt-4 grid aspect-[16/9] place-items-center rounded-2xl border border-dashed border-foreground/15 bg-background/60 text-xs text-foreground/45">
          Sem foto ainda
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleUpload(f);
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10 disabled:opacity-60"
      >
        <Upload className="size-3.5" />
        {uploading ? "Enviando…" : url ? "Trocar foto" : "Enviar foto"}
      </button>
      {err ? <p className="mt-2 text-[11px] text-destructive">{err}</p> : null}
    </div>
  );
}
