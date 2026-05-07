import { useState } from "react"
import { supabase } from "../lib/supabase"
import FightCard from "../components/Fightcard"
import { useEffect } from "react"

export default function Admin() {
    const [lado, setLado] = useState<"f1" | "f2">("f1")
    const [fightId, setFightId] = useState<string | null>(null)
    const [estado, setEstado] = useState("pendiente")
    const [ganador, setGanador] = useState("")
    const [streamUrl, setStreamUrl] = useState("")
    const [f1, setF1] = useState({
        nombre: "",
        peso: "",
        raza: "",
        victorias: 0,
        derrotas: 0,
        imagen: ""
    })

    const [f2, setF2] = useState({
        nombre: "",
        peso: "",
        raza: "",
        victorias: 0,
        derrotas: 0,
        imagen: ""
    })

    // 👉 gallo actual
    const current = lado === "f1" ? f1 : f2
    const setCurrent = lado === "f1" ? setF1 : setF2

    // 💾 crear pelea
    const crearPelea = async () => {
        console.log("🚀 CREANDO PELEA")

        const payload = {
            f1_nombre: f1.nombre,
            f1_peso: f1.peso,
            f1_raza: f1.raza,
            f1_victorias: f1.victorias,
            f1_derrotas: f1.derrotas,
            f1_imagen: f1.imagen,

            f2_nombre: f2.nombre,
            f2_peso: f2.peso,
            f2_raza: f2.raza,
            f2_victorias: f2.victorias,
            f2_derrotas: f2.derrotas,
            f2_imagen: f2.imagen,

            estado: "pendiente"
        }

        console.log("📦 PAYLOAD:", payload)

        const { data, error } = await supabase
            .from("fights")
            .insert(payload)
            .select()
            .maybeSingle()

        console.log("📦 RESPONSE DATA:", data)
        console.log("❌ ERROR:", error)

        if (!error && data) {
            setFightId(data.id)
            setEstado("pendiente")

            console.log("✅ PELEA CREADA ID:", data.id)
        }
    }
    const cargarPelea = async () => {
        console.log("🔍 CARGANDO PELEA")

        const { data, error } = await supabase
            .from("fights")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

        console.log("📦 PELEA:", data)
        console.log("❌ ERROR:", error)

        if (data) {
            setFightId(data.id)
            setEstado(data.estado)

            // 👇 cargar gallos
            setF1({
                nombre: data.f1_nombre || "",
                peso: data.f1_peso || "",
                raza: data.f1_raza || "",
                victorias: data.f1_victorias || 0,
                derrotas: data.f1_derrotas || 0,
                imagen: data.f1_imagen || ""
            })

            setF2({
                nombre: data.f2_nombre || "",
                peso: data.f2_peso || "",
                raza: data.f2_raza || "",
                victorias: data.f2_victorias || 0,
                derrotas: data.f2_derrotas || 0,
                imagen: data.f2_imagen || ""
            })
        }
    }
    useEffect(() => {
        cargarPelea()
    }, [])
    const convertirYoutubeEmbed = (url: string) => {
    const videoId = url.split("v=")[1]

    if (!videoId) return url

    return `https://www.youtube.com/embed/${videoId}`
}
    const iniciarPelea = async () => {
        console.log("▶️ INICIANDO PELEA:", fightId)

        const { data, error } = await supabase
            .from("fights")
            .update({ estado: "en_vivo", stream_url: convertirYoutubeEmbed(streamUrl) })
            .eq("id", fightId)
            .select()

        console.log("📦 UPDATE RESPONSE:", data)
        console.log("❌ ERROR:", error)

        setEstado("en_vivo")
    }

    const elegirGanador = async () => {
        console.log("🏆 ELIGIENDO GANADOR")

        // 1. actualizar pelea
        await supabase
            .from("fights")
            .update({
                ganador,
                estado: "finalizado"
            })
            .eq("id", fightId)
        setEstado("finalizado")
        // 2. traer apuestas
        const { data: bets } = await supabase
            .from("bets")
            .select("*")
            .eq("fight_id", fightId)

        console.log("📦 BETS:", bets)

        if (!bets) return

        // 3. separar
        const ganadores = bets.filter(b => b.lado === ganador)

        // 4. totales
        const total = bets.reduce((acc, b) => acc + b.monto, 0)
        const totalGanador = ganadores.reduce((acc, b) => acc + b.monto, 0)

        console.log("💰 TOTAL:", total)
        console.log("🏆 TOTAL GANADORES:", totalGanador)

        // 5. calcular y guardar
        for (let bet of bets) {
            if (bet.lado === ganador) {
                const ganancia = (bet.monto / totalGanador) * total

                console.log("✅ GANADOR:", bet.id, ganancia)

                await supabase
                    .from("bets")
                    .update({
                        resultado: "ganado",
                        ganancia
                    })
                    .eq("id", bet.id)

            } else {
                console.log("❌ PERDEDOR:", bet.id)

                await supabase
                    .from("bets")
                    .update({
                        resultado: "perdido",
                        ganancia: 0
                    })
                    .eq("id", bet.id)
            }
        }

        console.log("🔥 CALCULO TERMINADO")

    }
    const resetearPanel = () => {
        console.log("🔄 RESETEANDO PANEL")

        setFightId(null)
        setEstado("")

        setF1({
            nombre: "",
            peso: "",
            raza: "",
            victorias: 0,
            derrotas: 0,
            imagen: ""
        })

        setF2({
            nombre: "",
            peso: "",
            raza: "",
            victorias: 0,
            derrotas: 0,
            imagen: ""
        })

        setCurrent({
            nombre: "",
            peso: "",
            raza: "",
            victorias: 0,
            derrotas: 0,
            imagen: ""
        })

        setGanador("")
    }
    return (
        <div className=" bg-black text-white p-6">

            {/* SECCIÓN CONFIGURACIÓN */}
            <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-5 mb-6 shadow-lg shadow-yellow-500/20">

                <h2 className="text-yellow-400 font-semibold mb-4">
                    Configurar pelea
                </h2>

                {/* SELECT GALLO */}
                <select
                    onChange={(e) => setLado(e.target.value as "f1" | "f2")}
                    className="w-full mb-4 p-2 rounded bg-black border border-yellow-500 text-white"
                >
                    <option value="f1">Gallo 1</option>
                    <option value="f2">Gallo 2</option>
                </select>

                {/* INPUTS */}
                <div className="grid grid-cols-2 gap-3">

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            Nombre
                        </label>

                        <input
                            className="input w-full"
                            placeholder="Nombre"
                            value={current.nombre}
                            onChange={(e) =>
                                setCurrent({ ...current, nombre: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            Peso
                        </label>

                        <input
                            className="input w-full"
                            placeholder="Peso"
                            value={current.peso}
                            onChange={(e) =>
                                setCurrent({ ...current, peso: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            Raza
                        </label>

                        <input
                            className="input w-full"
                            placeholder="Raza"
                            value={current.raza}
                            onChange={(e) =>
                                setCurrent({ ...current, raza: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            Victorias
                        </label>

                        <input
                            className="input w-full"
                            type="number"
                            placeholder="Victorias"
                            value={current.victorias}
                            onChange={(e) =>
                                setCurrent({
                                    ...current,
                                    victorias: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            Derrotas
                        </label>

                        <input
                            className="input w-full"
                            type="number"
                            placeholder="Derrotas"
                            value={current.derrotas}
                            onChange={(e) =>
                                setCurrent({
                                    ...current,
                                    derrotas: Number(e.target.value)
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-yellow-400 mb-1">
                            URL imagen
                        </label>

                        <input
                            className="input w-full"
                            placeholder="URL imagen"
                            value={current.imagen}
                            onChange={(e) =>
                                setCurrent({ ...current, imagen: e.target.value })
                            }
                        />
                    </div>

                </div>

                {/* BOTÓN CREAR */}
                <button
                    onClick={crearPelea}
                    className="w-full mt-4 bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition"
                >
                    Crear pelea ⚔️
                </button>
            </div>

            {/* PREVIEW */}
            <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-5 mb-6 shadow-lg shadow-yellow-500/20">
                <h2 className="text-yellow-400 font-semibold mb-4">
                    Vista previa
                </h2>

                <div className="flex items-center justify-center gap-10">
                    <FightCard {...f1} />
                    <span className="text-yellow-400 text-xl font-bold">VS</span>
                    <FightCard {...f2} />
                </div>
            </div>

            {/* CONTROL DE PELEA */}
            {fightId && (
                <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-5 shadow-lg shadow-yellow-500/20">

                    <h2 className="text-yellow-400 font-semibold mb-4">
                        Control de pelea
                    </h2>
                    <div className="mb-4">
                        <label className="block text-sm text-yellow-400 mb-1">
                            Link del stream
                        </label>

                        <input
                            className="w-full p-2 rounded bg-black border border-yellow-500 text-white"
                            placeholder="https://youtube.com/watch?v=..."
                            value={streamUrl}
                            onChange={(e) => setStreamUrl(e.target.value)}
                        />
                    </div>
                    {estado === "pendiente" && (

                        <button
                            onClick={iniciarPelea}
                            disabled={estado !== "pendiente"}
                            className={`w-full py-2 rounded font-bold transition ${estado !== "pendiente"
                                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                : "bg-green-500 text-black hover:bg-green-400"
                                }`}
                        >
                            Iniciar pelea ▶️
                        </button>
                    )}

                    {estado === "en_vivo" && (
                        <div className="flex flex-col gap-3">

                            <select
                                onChange={(e) => setGanador(e.target.value)}
                                className="p-2 rounded bg-black border border-yellow-500 text-white"
                            >
                                <option>Seleccionar ganador</option>
                                <option value="f1">Gallo 1</option>
                                <option value="f2">Gallo 2</option>
                            </select>

                            <button
                                onClick={elegirGanador}
                                disabled={estado !== "en_vivo"}
                                className={`py-2 rounded font-bold transition ${estado !== "en_vivo"
                                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    : "bg-red-500 text-white hover:bg-red-400"
                                    }`}
                            >
                                Finalizar pelea 🏆
                            </button>

                        </div>
                    )}
                    {estado === "finalizado" && (
                        <div className="mt-4 text-center">
                            <p className="text-yellow-400 font-bold text-lg">
                                🏆 Ganador: {ganador === "f1" ? f1.nombre : f2.nombre}
                            </p>
                        </div>
                    )}
                    {estado === "finalizado" && (
                        <button
                            onClick={resetearPanel}
                            className="mt-4 w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition"
                        >
                            Nueva pelea 🔄
                        </button>
                    )}
                </div>

            )}
        </div>
    )
}