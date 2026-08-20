import { useEffect, useState } from "react";
import axios from "axios";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

/** Affiche une image locale (/api/v1/files/…) avec le token JWT, ou une URL externe directement. */
export function AuthenticatedImage({ src, alt, className }: Props) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }
    if (src.startsWith("http://") || src.startsWith("https://")) {
      setDisplaySrc(src);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    const filename = src.replace(/^.*\/files\//, "");
    const base = import.meta.env.VITE_API_URL || "/api/v1";
    const token = localStorage.getItem("accessToken");
    axios
      .get(`${base}/files/${filename}`, {
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setDisplaySrc(objectUrl);
        setError(false);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-xs text-gray-400 ${className ?? ""}`}>
        Image indisponible
      </div>
    );
  }

  if (!displaySrc) {
    return <div className={`animate-pulse bg-gray-100 ${className ?? ""}`} />;
  }

  return <img src={displaySrc} alt={alt} className={className} />;
}
