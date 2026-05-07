import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import type { User } from "@supabase/supabase-js"
import Login from "./login"
import Admin from "./pages/admin"
import Home from "./pages/home"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🚀 INIT APP")

    // obtener usuario
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)

      if (data.user) {
        await getRole(data.user.id)
      }

      setLoading(false)
    })

    // escuchar login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔄 AUTH CHANGE:", session)

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        getRole(currentUser.id)
      } else {
        setRole("")
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 🔐 obtener rol desde profiles
  const getRole = async (userId: string) => {
    console.log("🔍 BUSCANDO ROLE PARA:", userId)

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()

    console.log("📦 ROLE DATA:", data)
    console.log("❌ ROLE ERROR:", error)

    if (data) {
      console.log("✅ ROLE SET:", data.role)
      setRole(data.role)
    }
  }

  console.log("🎯 USER STATE:", user)
  console.log("🎯 ROLE STATE:", role)
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-yellow-400 text-xl animate-pulse">
        Cargando...
      </div>
    </div>
  )
}
  // 👇 NO LOGUEADO
  if (!user) {
    return <Login />
  }

  // 👑 ADMIN
if (role.toLowerCase() === "admin") {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b border-yellow-500">
        <h3 className="text-yellow-400 font-bold">Admin Panel</h3>

        <button
          onClick={async () => await supabase.auth.signOut()}
          className="border border-yellow-500 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/10 transition"
        >
          Cerrar sesión
        </button>
      </div>

      <Admin />
    </div>
  )
}

  console.log("👤 ES USUARIO NORMAL")

  // 👤 USUARIO NORMAL
return (
  <div className="min-h-screen bg-black text-white">

    {/* HEADER */}
    <div className="flex justify-between items-center p-4 border-b border-yellow-500">
      <h2 className="text-yellow-400 font-bold">Apuestas 🐔</h2>

      <button
        onClick={async () => await supabase.auth.signOut()}
        className="border border-yellow-500 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/10 transition"
      >
        Cerrar sesión
      </button>
    </div>

    <Home />
  </div>
)}


export default App