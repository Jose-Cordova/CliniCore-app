/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        brand: {
          teal: "#0D9488",
          cyan: "#06B6D4",
          emerald: "#10B981",
          indigo: "#4F46E5",
        },
        sidebar: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          text: "#94A3B8",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)",
        "soft-xl": "0 20px 40px -15px rgba(37, 99, 235, 0.1), 0 10px 25px -5px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};