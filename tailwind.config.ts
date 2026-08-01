import type { Config } from "tailwindcss";

/**
 * Paleta de VizFitness.
 *
 * La marca es el naranja #FF6F00. Para que no chille, todo lo demás es
 * neutro **cálido** (grises con una pizca de marrón en vez del gris azulado
 * de Tailwind): sobre un fondo frío el naranja se ve sucio, sobre uno cálido
 * se integra. Como color de apoyo va un turquesa, que es el complementario
 * del naranja y es lo que hace que las dos categorías (cardio y gimnasio) se
 * distingan de un vistazo en las gráficas.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fondos, de más oscuro a más claro. El 950 no es negro puro para
        // que no "sangre" en pantallas OLED.
        base: {
          950: "#12100E",
          900: "#1B1714",
          850: "#201B17",
          800: "#251F1A",
          700: "#332A23",
          600: "#463A30",
        },
        // Naranja de marca. `soft` es para hover y texto sobre fondo oscuro;
        // `dark` para estados pulsados y rellenos apagados.
        accent: {
          DEFAULT: "#FF6F00",
          dark: "#C25100",
          soft: "#FFA040",
        },
        // Colores de categoría: naranja para cardio, turquesa para gimnasio.
        cardio: "#FF8A1F",
        gym: "#2DC5C9",
        // Escala de texto. Se sobrescribe `slate` a propósito en vez de
        // renombrar las clases una a una: así todo el `text-slate-400` que ya
        // había pasa a ser gris cálido sin tocar cada componente.
        slate: {
          100: "#F6F2EE",
          200: "#E8E1D9",
          300: "#D3C9BE",
          400: "#A79B8D",
          500: "#87796B",
          600: "#6B5E52",
          700: "#4E443B",
          800: "#332C26",
          900: "#211C18",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      boxShadow: {
        // Sombras suaves y con profundidad, no el borde gris plano de siempre.
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        float: "0 20px 50px -20px rgba(0,0,0,0.8)",
        glow: "0 8px 28px -8px rgba(255,111,0,0.55)",
        "glow-sm": "0 4px 16px -6px rgba(255,111,0,0.5)",
      },
      transitionTimingFunction: {
        // Movimiento "Silk": aceleración natural, salida suave y con cuerpo.
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
        "silk-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        sheet: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        pop: "pop 0.32s cubic-bezier(0.22, 1, 0.36, 1) both",
        sheet: "sheet 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        fade: "fade 0.25s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
