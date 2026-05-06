import { useState } from "react"

type Props = {
  visible: boolean
  lado: "f1" | "f2" | null
  onClose: () => void
  onConfirm: (monto: number, lado: "f1" | "f2") => void
}

export default function BetModal({ visible, lado, onClose, onConfirm }: Props) {
  const [step, setStep] = useState(1)
  const [monto, setMonto] = useState("")

  if (!visible || !lado) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-6 w-80 shadow-lg shadow-yellow-500/20">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h2 className="text-yellow-400 text-xl font-bold text-center mb-4">
              💰 Apostar
            </h2>

            <p className="text-gray-300 text-center mb-4">
              Ingresa el monto para apostar al{" "}
              <span className="text-yellow-400 font-semibold">
                {lado === "f1" ? "Gallo 1" : "Gallo 2"}
              </span>
            </p>

            <input
              className="w-full mb-4 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Monto"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />

            <button
              onClick={() => {
                if (!monto) return alert("Ingresa un monto")
                setStep(2)
              }}
              className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition mb-2"
            >
              Continuar →
            </button>

            <button
              onClick={onClose}
              className="w-full border border-yellow-500 text-yellow-400 py-2 rounded hover:bg-yellow-500/10 transition"
            >
              Cancelar
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <h2 className="text-yellow-400 text-xl font-bold text-center mb-4">
              ⚠️ Confirmar
            </h2>

            <p className="text-gray-300 text-center mb-4">
              Apostarás{" "}
              <span className="text-yellow-400 font-bold">
                S/{monto}
              </span>{" "}
              al{" "}
              <span className="text-yellow-400 font-semibold">
                {lado === "f1" ? "Gallo 1" : "Gallo 2"}
              </span>
            </p>

            <button
              onClick={() => {
                onConfirm(Number(monto), lado)
                setStep(1)
                setMonto("")
              }}
              className="w-full bg-green-500 text-black font-bold py-2 rounded hover:bg-green-400 transition mb-2"
            >
              Confirmar ✅
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full border border-yellow-500 text-yellow-400 py-2 rounded hover:bg-yellow-500/10 transition"
            >
              ← Volver
            </button>
          </>
        )}

      </div>
    </div>
  )
}