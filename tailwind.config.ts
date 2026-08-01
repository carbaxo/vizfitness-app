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
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
