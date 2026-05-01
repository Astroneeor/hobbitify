import { useEffect, useRef } from "react";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

type TurnstileTheme = "light" | "dark" | "auto";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: TurnstileTheme;
  appearance?: "always" | "execute" | "interaction-only";
}

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(script);
  });
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  /** Called once the widget is mounted so the parent can reset it after errors. */
  onReady?: (handlers: { reset: () => void }) => void;
  theme?: TurnstileTheme;
  className?: string;
}

export const Turnstile: React.FC<TurnstileProps> = ({
  siteKey,
  onVerify,
  onExpire,
  onError,
  onReady,
  theme = "auto",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadTurnstileScript()
      .then(() => {
        if (cancelled) return;
        if (!containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": onExpire,
          "error-callback": onError,
          theme,
        });
        const wid = widgetIdRef.current;
        onReady?.({
          reset: () => {
            if (wid && window.turnstile) {
              window.turnstile.reset(wid);
            }
          },
        });
      })
      .catch(() => {
        onError?.();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be gone if the script never finished loading.
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire, onError, onReady, theme]);

  return <div ref={containerRef} className={className} />;
};
