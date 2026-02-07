export default function Loading() {
  return (
    <div className="min-h-screen bg-white" role="status" aria-label="Cargando página">
      {/* Hero skeleton */}
      <div className="relative h-screen bg-secondary-100 animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
          {/* Badge */}
          <div className="w-56 h-8 bg-secondary-200 rounded-full" />
          {/* Logo */}
          <div className="w-72 h-14 bg-secondary-200 rounded-lg" />
          {/* Título */}
          <div className="w-full max-w-lg h-12 bg-secondary-200 rounded-lg" />
          {/* Subtítulo */}
          <div className="w-full max-w-md h-6 bg-secondary-200 rounded-lg" />
          {/* Botones */}
          <div className="flex gap-4 mt-4">
            <div className="w-40 h-12 bg-secondary-200 rounded-full" />
            <div className="w-40 h-12 bg-secondary-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Sección skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Título sección */}
        <div className="flex flex-col items-center gap-4 mb-14">
          <div className="w-32 h-7 bg-secondary-100 rounded-full animate-pulse" />
          <div className="w-80 h-10 bg-secondary-100 rounded-lg animate-pulse" />
          <div className="w-64 h-5 bg-secondary-100 rounded-lg animate-pulse" />
        </div>

        {/* Grid cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-secondary-100">
              <div className="aspect-[4/5] bg-secondary-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="w-16 h-4 bg-secondary-100 rounded animate-pulse" />
                <div className="w-full h-5 bg-secondary-100 rounded animate-pulse" />
                <div className="w-24 h-7 bg-secondary-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen reader */}
      <span className="sr-only">Cargando contenido de Lukess Home...</span>
    </div>
  );
}
