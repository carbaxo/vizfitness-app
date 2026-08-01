/**
 * El logotipo: **VIZ** en blanco y **FITNESS** en el naranja de marca, en
 * mayúsculas, muy grueso y con la letra apretada. Misma construcción que el
 * logotipo de VizPlay, cambiando la palabra y el color de acento.
 *
 * Vive en un único sitio para que la barra lateral, la cabecera del móvil y
 * la pantalla de inicio de sesión no puedan quedar distintas.
 */
export default function Wordmark({ className = "text-lg" }: { className?: string }) {
  return (
    <span className={`font-extrabold uppercase tracking-tight ${className}`}>
      <span className="text-white">VIZ</span>
      <span className="text-accent">FITNESS</span>
    </span>
  );
}
