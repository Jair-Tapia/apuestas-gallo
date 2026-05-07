import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [loading, setLoading] = useState(false)

const handleRegister = async () => {
  await supabase.auth.signOut()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    alert(error.message)
    return
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        nombre,
        email: email,
        role: "user",
      })

    console.log("PROFILE ERROR:", profileError)
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      
      <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-8 w-80 shadow-lg shadow-yellow-500/20">

        <h2 className="text-yellow-400 text-2xl text-center mb-6 font-bold">
          Crear cuenta
        </h2>

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {loading ? "Creando..." : "Registrarse"}
        </button>

      </div>
    </div>
  )
}