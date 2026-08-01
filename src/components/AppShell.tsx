"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Wordmark from "@/components/Wordmark";

const NAV = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/entrenar", label: "Entrenar", icon: "🏋️" },
  { href: "/planes", label: "Planes", icon: "🗓️" },
  { href: "/progreso", label: "Progreso", icon: "📈" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">💪</span>
      <Wordmark />
    </div>
  );
}

function LoginScreen() {
  const { signInWithGoogle, configured } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">💪</div>
      <h1>
        <Wordmark className="text-4xl" />
      </h1>
      <p className="mt-3 max-w-md text-slate-400">
        Registra tus entrenamientos de cardio y gimnasio, crea planes de
        entrenamiento y sigue tu progreso. Tus datos se sincronizan en todos
        tus dispositivos.
      </p>

      {configured ? (
        <button
          onClick={() => signInWithGoogle().catch((e) => alert(e.message))}
          className="btn-primary mt-8 px-6 py-3 text-base"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.9h5.3c-.5 2.4-2.6 3.9-5.3 3.9a5.9 5.9 0 1 1 0-11.8c1.5 0 2.8.5 3.8 1.4l2.2-2.2A9 9 0 1 0 12 21c5.2 0 8.9-3.7 8.9-8.9 0-.3 0-.7-.1-1z"
            />
          </svg>
          Continuar con Google
        </button>
      ) : (
        <div className="card mt-8 max-w-md text-left text-sm text-slate-300">
          <p className="font-semibold text-amber-400">
            ⚠️ Firebase no está configurado
          </p>
          <p className="mt-2">
            Para activar el inicio de sesión con Google y la sincronización,
            crea un proyecto en Firebase y copia tus claves en un archivo{" "}
            <code className="rounded bg-base-800 px-1">.env.local</code>.
            Encontrarás la guía paso a paso en el{" "}
            <code className="rounded bg-base-800 px-1">README.md</code> del
            repositorio.
          </p>
        </div>
      )}

      <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 text-xs text-slate-400">
        <div className="card !p-3">🏃 Cardio con ritmo y distancia</div>
        <div className="card !p-3">🏋️ Gimnasio con series y récords</div>
        <div className="card !p-3">🗓️ Planes de entrenamiento</div>
      </div>
    </main>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-4xl">💪</div>
      </main>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      {/* Barra lateral en escritorio */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-col gap-1 border-r border-white/5 p-4 md:flex">
        <div className="mb-6 px-2 pt-2">
          <Logo />
        </div>
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`press flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-accent/12 text-accent"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera en móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-base-950/70 px-4 py-3 backdrop-blur-xl pt-safe md:hidden">
          <Logo />
        </header>

        {/* Sin animación en <main>: transform/opacity aquí crearían un stacking
            context/containing block que rompería los sheets (position: fixed). */}
        <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:pb-8">{children}</main>

        {/* Barra de navegación inferior tipo app nativa */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-base-950/80 backdrop-blur-2xl pb-safe md:hidden">
          <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="press flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 pt-1.5"
                >
                  <span
                    className={`flex h-9 w-14 items-center justify-center rounded-2xl text-xl transition-all duration-300 ease-silk ${
                      active
                        ? "-translate-y-0.5 scale-105 bg-accent/15 text-accent"
                        : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`text-[11px] font-semibold transition-colors ${
                      active ? "text-accent" : "text-slate-500"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
