function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Si Tailwind funciona, verás un anillo dorado y texto brillante */}
      <div className="bg-slate-800 p-8 rounded-2xl shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] border border-slate-700 text-center max-w-sm ring-4 ring-yellow-500/20">
        <h1 className="text-4xl font-black text-yellow-500 italic uppercase tracking-tighter mb-4">
          Monster Band
        </h1>
        <p className="text-slate-400 font-medium">
          Si ves este fondo oscuro, bordes redondeados y texto amarillo, <span className="text-green-400 font-bold underline">Tailwind está ACTIVO</span>.
        </p>
        <button className="mt-6 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-full transition-all hover:scale-105 active:scale-95">
          ¡LISTO PARA EL ENSAYO!
        </button>
      </div>
    </div>
  )
}

export default App
