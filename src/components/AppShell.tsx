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
      <aside className="sticky top-0 hidden h-screen w-56 flex-col gap-1 border-r border-base-700/60 p-4 md:flex">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent/15 text-accent"
                  : "text-slate-300 hover:bg-base-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera en móvil */}
        <header className="flex items-center justify-between border-b border-base-700/60 px-4 py-3 md:hidden">
          <Logo />
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-8">{children}</main>

        {/* Navegación inferior en móvil */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-base-700/60 bg-base-900/95 py-2 backdrop-blur md:hidden">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium ${
                  active ? "text-accent" : "text-slate-400"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
