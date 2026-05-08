import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import FightCard from "../components/Fightcard"
import BetModal from "../components/BetModal"
import Historial from "../components/Historial"

export default function Home() {
    const [fight, setFight] = useState<any>(null)
    const [ladoSeleccionado, setLadoSeleccionado] = useState<"f1" | "f2" | null>(null)
    const [yaAposto, setYaAposto] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [checkingBet, setCheckingBet] = useState(true)
    const [mostrarHistorial, setMostrarHistorial] = useState(false)
    const [totalF1, setTotalF1] = useState(0)
    const [totalF2, setTotalF2] = useState(0)
    const [countF1, setCountF1] = useState(0)
    const [countF2, setCountF2] = useState(0)
    const [miApuesta, setMiApuesta] = useState<any>(null)
    const [nombreUsuario, setNombreUsuario] = useState("")

    const cargarUsuario = async () => {
        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) return

        const { data } = await supabase
            .from("profiles")
            .select("nombre")
            .eq("id", userData.user.id)
            .single()

        if (data) {
            setNombreUsuario(data.nombre)
        }
    }

    useEffect(() => {
        cargarPelea()
        cargarUsuario()
    }, [])
    const cargarApuestas = async (fightId: string) => {
        const { data } = await supabase
            .from("bets")
            .select("*")
            .eq("fight_id", fightId)

        if (!data) return

        const f1 = data.filter(b => b.lado === "f1")
        const f2 = data.filter(b => b.lado === "f2")

        setTotalF1(f1.reduce((acc, b) => acc + b.monto, 0))
        setTotalF2(f2.reduce((acc, b) => acc + b.monto, 0))

        setCountF1(f1.length)
        setCountF2(f2.length)
    }
    const cargarPelea = async () => {
        console.log("🔍 BUSCANDO PELEA")

        const { data } = await supabase
            .from("fights")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

        setFight(data)
        setYaAposto(false)

        const { data: userData } = await supabase.auth.getUser()

        if (userData.user && data) {
            const { data: apuesta } = await supabase
                .from("bets")
                .select("*")
                .eq("user_id", userData.user.id)
                .eq("fight_id", data.id)

            console.log("🔍 APUESTA EXISTENTE:", apuesta)

            if (apuesta && apuesta.length > 0) {
                setYaAposto(true)
                setMiApuesta(apuesta[0])
            }
            if (data) {
                setFight(data)

                await cargarApuestas(data.id) // 🔥
            }
        }

        setCheckingBet(false) // 🔥 IMPORTANTE
    }
    useEffect(() => {
        if (!fight) return

        const channel = supabase
            .channel("bets-channel")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bets"
                },
                () => {
                    cargarApuestas(fight.id)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fight])
    useEffect(() => {
        cargarPelea()
    }, [])
    const abrirModal = (lado: "f1" | "f2") => {
        console.log("🟡 ABRIR MODAL:", lado)
        setLadoSeleccionado(lado)
        setModalVisible(true)
    }

    const confirmarApuesta = async (monto: number, lado: "f1" | "f2") => {
        console.log("💰 CONFIRMADA DESDE MODAL")

        if (!fight || fight.estado !== "pendiente") {
            alert("No se puede apostar")
            return
        }

        const { data: userData } = await supabase.auth.getUser()

        if (!userData.user) {
            alert("Debes iniciar sesión")
            return
        }

        const { data: yaExiste } = await supabase
            .from("bets")
            .select("*")
            .eq("user_id", userData.user.id)
            .eq("fight_id", fight.id)

        if (yaExiste && yaExiste.length > 0) {
            alert("Ya apostaste")
            setYaAposto(true)
            return
        }
        setModalVisible(false)

        setMiApuesta({
            lado,
            monto
        })
        setYaAposto(true)

        if (lado === "f1") {
            setTotalF1(prev => prev + monto)
            setCountF1(prev => prev + 1)
        } else {
            setTotalF2(prev => prev + monto)
            setCountF2(prev => prev + 1)
        }

        setModalVisible(false)

        const { error } = await supabase.from("bets").insert({
            user_id: userData.user.id,
            fight_id: fight.id,
            lado,
            monto
        })

        console.log("❌ ERROR:", error)

        if (error) {
            if (error.message.includes("duplicate")) {
                alert("Ya apostaste en esta pelea")
                setYaAposto(true)
            } else {
                alert("Error al apostar")
            }
            return

        }

    }
    if (!fight) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400 text-xl">
                No hay pelea activa
            </div>
        )
    }

    return (
        <div className="bg-black text-white px-4 md:px-6 pb-6">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row items-center mb-3">

                {/* IZQUIERDA */}
                <div className="flex-1">
                    <p className="text-xl md:text-3xl text-gray-300 font-medium">
                        Bienvenido,{" "}
                        <span className="text-xl md:text-3xl font-bold text-yellow-400">
                            {nombreUsuario}
                        </span>
                    </p>
                </div>

                {/* CENTRO */}
                <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">
                    Pelea 🔥
                </h1>

                {/* DERECHA */}
                <div className="flex-1 flex justify-end mt-2 md:mt-0">
                    <button
                        onClick={() => setMostrarHistorial(!mostrarHistorial)}
                        className="border border-yellow-500 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/10 transition"
                    >
                        🔔
                    </button>
                </div>

            </div>

            {/* 🎥 VIDEO */}
            {fight.estado === "en_vivo" && (
                <div className="flex justify-center mb-6">
                    <iframe
                        className="w-full max-w-xl aspect-video rounded-lg border border-yellow-500"
                        src={fight.stream_url}
                        allowFullScreen
                    />
                </div>
            )}

            {/* 🐔 VS */}
            <div className="flex flex-col items-center gap-6">

                {/* 🔥 responsive layout */}
                <div className="flex items-center justify-center gap-4 md:gap-10">

                    <FightCard {...{
                        nombre: fight.f1_nombre,
                        peso: fight.f1_peso,
                        raza: fight.f1_raza,
                        victorias: fight.f1_victorias,
                        derrotas: fight.f1_derrotas,
                        imagen: fight.f1_imagen,
                        total: totalF1,
                        count: countF1
                    }} />

                    <span className="text-yellow-400 text-lg md:text-2xl font-bold">
                        VS
                    </span>

                    <FightCard {...{
                        nombre: fight.f2_nombre,
                        peso: fight.f2_peso,
                        raza: fight.f2_raza,
                        victorias: fight.f2_victorias,
                        derrotas: fight.f2_derrotas,
                        imagen: fight.f2_imagen,
                        total: totalF2,
                        count: countF2
                    }} />

                </div>

                {/* 💰 BOTONES */}
                {fight.estado === "pendiente" && !checkingBet && !yaAposto && (
                    <div className="flex items-center justify-center gap-4 md:gap-10">

                        <button
                            onClick={() => abrirModal("f1")}
                            className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition"
                        >
                            Apostar Gallo 1 💰
                        </button>

                        <button
                            onClick={() => abrirModal("f2")}
                            className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition"
                        >
                            Apostar Gallo 2 💰
                        </button>

                    </div>
                )}

                {/* ✅ YA APOSTÓ */}
                {fight.estado === "pendiente" && yaAposto && miApuesta && (
                    <div className="mt-4 text-center px-2">
                        <p className="text-gray-400">
                            ✅ Ya realizaste tu apuesta
                        </p>

                        <p className="text-yellow-400 font-semibold">
                            Apostaste S/{miApuesta.monto} al{" "}
                            {miApuesta.lado === "f1"
                                ? `${fight.f1_nombre} 🐔`
                                : `${fight.f2_nombre} 🐔`}
                        </p>
                    </div>
                )}

                {/* 🏆 RESULTADO */}
                {fight.estado === "finalizado" && (
                    <div className="mt-6 text-center">
                        <h2 className="text-lg md:text-xl text-yellow-400 font-bold">
                            🏆 Ganador: {fight.ganador === "f1" ? "Gallo 1" : "Gallo 2"}
                        </h2>
                    </div>
                )}

            </div>

            {/* MODAL */}
            <BetModal
                visible={modalVisible}
                lado={ladoSeleccionado}
                onClose={() => setModalVisible(false)}
                onConfirm={confirmarApuesta}
            />

            {/* HISTORIAL */}
            {mostrarHistorial && (
                <Historial onClose={() => setMostrarHistorial(false)} />
            )}
        </div>
    )
}