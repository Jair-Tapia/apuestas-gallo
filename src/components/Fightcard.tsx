type Props = {
  nombre: string
  peso: string
  raza: string
  victorias: number
  derrotas: number
  imagen: string
  total?: number
  count?: number
}

export default function FightCard({
  nombre,
  peso,
  raza,
  victorias,
  derrotas,
  imagen,
  total,
  count
}: Props) {

return (
  <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-3 w-36 md:w-44 text-center shadow-lg shadow-yellow-500/20 hover:scale-105 transition">

  {/* 🐔 Imagen */}
  <div className="flex justify-center mb-2">
    <img
      src={imagen}
      alt={nombre}
      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-yellow-500"
    />
  </div>

  {/* 📛 Nombre */}
  <h3 className="text-yellow-400 font-bold text-sm md:text-base mb-1">
    {nombre}
  </h3>

  {/* 📊 Stats */}
  <div className="text-white text-xs md:text-sm space-y-0.5">
    <p><span className="text-yellow-400">Peso:</span> {peso}</p>
    <p><span className="text-yellow-400">Raza:</span> {raza}</p>

    <div className="flex justify-center gap-2 mt-1">
      <p className="text-green-400 font-semibold">V: {victorias}</p>
      <p className="text-red-400 font-semibold">D: {derrotas}</p>
    </div>
  </div>

  {/* 💰 Apuestas */}
  {total !== undefined && (
    <div className="mt-2 border-t border-yellow-500 pt-1">
      <p className="text-yellow-400 font-semibold text-xs md:text-sm">
        💰 S/{total}
      </p>
      <p className="text-gray-300 text-[11px] md:text-xs">
        👥 {count}
      </p>
    </div>
  )}
</div>
)}