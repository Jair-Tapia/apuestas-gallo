import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Historial({ onClose }: { onClose?: () => void }) {
  const [bets, setBets] = useState<any[]>([])

  const cargar = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) return

    const { data } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })

    setBets(data || [])
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="absolute top-16 right-5 w-80 bg-zinc-900 border border-yellow-500 rounded-xl shadow-lg shadow-yellow-500/20 p-4 z-50">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-yellow-400 font-bold text-lg">
          📜 Historial
        </h3>

        {onClose && (
          <button
            onClick={onClose}
            className="text-yellow-400 hover:text-yellow-300"
          >
            ✕
          </button>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="max-h-80 overflow-y-auto space-y-3 pr-1">

        {bets.length === 0 && (
          <p className="text-gray-400 text-center">
            No tienes apuestas aún
          </p>
        )}

        {bets.map((b) => (
          <div
            key={b.id}
            className="bg-black border border-yellow-500 rounded-lg p-3"
          >
            <p className="text-white text-sm">
              💰 Apostaste: <span className="text-yellow-400">S/{b.monto}</span>
            </p>

            {b.resultado === "ganado" && (
              <p className="text-green-400 font-semibold mt-1">
                🏆 Ganaste S/{b.ganancia?.toFixed(2)}
              </p>
            )}

            {b.resultado === "perdido" && (
              <p className="text-red-400 font-semibold mt-1">
                ❌ Perdiste
              </p>
            )}

            {!b.resultado && (
              <p className="text-gray-400 mt-1">
                ⏳ Pendiente
              </p>
            )}
          </div>
        ))}

      </div>
    </div>
  )
}