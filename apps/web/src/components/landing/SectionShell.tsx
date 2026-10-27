import type { ReactNode } from 'react';

type SectionShellProps = {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
};

export function SectionShell({
  id,
  title,
  subtitle,
  children,
  className = '',
  bordered = false,
}: SectionShellProps) {
  return (
    <section
      id={id}
      className={`py-24 md:py-32 scroll-mt-20 ${bordered ? 'border-y border-slate-800/60 bg-slate-900/20' : ''} ${className}`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          {subtitle && (
            <p className="text-slate-400 text-lg leading-relaxed">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function BadgePill({ label }: { label: string }) {
  return (
    <span className="text-[10px] uppercase tracking-wider text-cyan-400/80 border border-cyan-500/20 rounded-full px-2 py-0.5 shrink-0">
      {label}
    </span>
  );
}
