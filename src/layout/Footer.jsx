const Footer = () => (
  <footer className="w-full px-4 md:px-6 py-3 bg-gradient-to-r from-slate-900 via-sidebar to-slate-900 border-t border-slate-800 text-slate-400 shadow-inner shrink-0 text-center text-xs">
    <div className="flex items-center justify-center gap-2">
      <span className="font-extrabold font-display text-white tracking-wide">
        Clini<span className="text-teal-400">Core</span>
      </span>
      <span className="text-slate-600">•</span>
      <span>© {new Date().getFullYear()} Sistema de Gestión Médica — Todos los derechos reservados</span>
    </div>
  </footer>
);

export default Footer;