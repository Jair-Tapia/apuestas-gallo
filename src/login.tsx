import { useState } from "react"
import { supabase } from "./lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [isRegister, setIsRegister] = useState(false)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) alert(error.message)
    else alert("Login exitoso 🚀")
  }

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        nombre,
        role: "user",
      })
    }

    alert("Usuario registrado 🎉")
    setIsRegister(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-zinc-900 border border-yellow-500 rounded-xl p-8 w-80 shadow-lg shadow-yellow-500/20">

        <h2 className="text-yellow-400 text-2xl text-center mb-6 font-bold">
          {isRegister ? "Crear cuenta" : "Bienvenido"}
        </h2>

        {isRegister && (
          <input
            className="w-full mb-3 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            type="text"
            placeholder="Nombre"
            onChange={(e) => setNombre(e.target.value)}
          />
        )}

        <input
          className="w-full mb-3 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          type="email"
          placeholder="Correo"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 rounded bg-black border border-yellow-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          type="password"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={isRegister ? handleRegister : handleLogin}
          className="w-full bg-yellow-500 text-black font-bold py-2 rounded hover:bg-yellow-400 transition"
        >
          {isRegister ? "Registrarse" : "Iniciar sesión"}
        </button>

        {!isRegister ? (
          <p
            onClick={() => setIsRegister(true)}
            className="text-yellow-400 text-center mt-4 cursor-pointer hover:underline"
          >
            ¿No tienes cuenta? Crear una
          </p>
        ) : (
          <p
            onClick={() => setIsRegister(false)}
            className="text-yellow-400 text-center mt-4 cursor-pointer hover:underline"
          >
            ← Volver al login
          </p>
        )}
      </div>
    </div>
  )
}