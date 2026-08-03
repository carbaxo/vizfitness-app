/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import Icon, { type IconName } from "@/components/Icon";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/entrenar", label: "Entrenar", icon: "dumbbell" },
  { href: "/planes", label: "Planes", icon: "calendar" },
  { href: "/progreso", label: "Progreso", icon: "chart" },
  { href: "/perfil", label: "Perfil", icon: "user" },
];

const SECONDARY_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/ejercicios", label: "Ejercicios", icon: "book" },
  { href: "/historial", label: "Historial", icon: "history" },
];

function Logo() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <div className="flex items-center gap-2.5">
      <img src={`${base}/brand/viz-mark.svg`} alt="VizFitness" className="brand-mark" />
      <span className="text-lg font-extrabold uppercase tracking-[-0.04em]">
        Viz<span className="text-accent">Fitness</span>
      </span>
    </div>
  );
}

function LoginScreen() {
  const { signInWithGoogle, configured } = useAuth();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6"><img src={`${base}/brand/viz-mark.svg`} alt="VizFitness" className="brand-mark !h-16 !w-16 !rounded-2xl" /></div>
      <h1 className="text-4xl font-extrabold uppercase tracking-[-0.05em]">
        Viz<span className="text-accent">Fitness</span>
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
        <div className="card !p-3"><Icon name="run" className="mx-auto mb-2 h-5 w-5 text-cardio" />Cardio y distancia</div>
        <div className="card !p-3"><Icon name="dumbbell" className="mx-auto mb-2 h-5 w-5 text-gym" />Fuerza y récords</div>
        <div className="card !p-3"><Icon name="calendar" className="mx-auto mb-2 h-5 w-5 text-accent" />Planes semanales</div>
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
        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/brand/viz-mark.svg`} alt="" className="brand-mark animate-pulse" />
      </main>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px]">
      {/* Barra lateral en escritorio */}
      <aside className="app-sidebar sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-base-700/60 p-5 md:flex">
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
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                  active
                  ? "bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(52,211,153,.12)]"
                  : "text-slate-400 hover:bg-base-800/80 hover:text-slate-100"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <p className="mb-1 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">Explorar</p>
        {SECONDARY_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${active ? "bg-accent/15 text-accent" : "text-slate-400 hover:bg-base-800/80 hover:text-slate-100"}`}>
              <Icon name={item.icon} className="h-5 w-5" />{item.label}
            </Link>
          );
        })}
        <div className="mt-auto rounded-2xl border border-base-700/50 bg-base-900/70 p-3">
          <div className="flex items-center gap-3">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="h-9 w-9 rounded-xl object-cover" referrerPolicy="no-referrer" /> : <span className="grid h-9 w-9 place-items-center rounded-xl bg-base-700"><Icon name="user" className="h-4 w-4" /></span>}
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{user?.displayName ?? "Atleta"}</p><p className="truncate text-[11px] text-slate-500">Cuenta sincronizada</p></div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera en móvil */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-base-700/60 bg-base-950/85 px-4 py-3 backdrop-blur-xl md:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            {SECONDARY_NAV.map((item) => <Link key={item.href} href={item.href} aria-label={item.label} className="rounded-xl p-2 text-slate-400 hover:bg-base-800 hover:text-accent"><Icon name={item.icon} className="h-5 w-5" /></Link>)}
          </div>
        </header>

        <main className="app-content flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-10">{children}</main>

        {/* Navegación inferior en móvil */}
        <nav className="app-mobile-nav fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-base-700/60 pt-2 md:hidden">
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
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
