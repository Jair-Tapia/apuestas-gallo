import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log(error)
      return
    }

    // 👇 GUARDAR EN profiles
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        role: "user",
      })
    }

    alert("Usuario creado")
  }

  return (
    <div>
      <h2>Registro</h2>

      <input
        placeholder="correo"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>
        Registrarse
      </button>
    </div>
  )
}