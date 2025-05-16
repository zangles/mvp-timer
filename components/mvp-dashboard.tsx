"use client"

import { useState, useEffect } from "react"
import { TrackedMVPList } from "./tracked-mvp-list"
import { MVPGrid } from "./mvp-grid"
import { DiscordSettings } from "./discord-settings"
import { getMVPs } from "@/lib/mvp-service"
import { refreshTrackersFromServer } from "@/lib/storage-service"
import type { MVP, MVPTracker } from "@/types/mvp"

export default function MVPDashboard() {
  const [mvps, setMvps] = useState<MVP[]>([])
  const [trackedMvps, setTrackedMvps] = useState<MVPTracker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [guildId, setGuildId] = useState("web-interface")
  const [channelId, setChannelId] = useState("dashboard")
  const [discordSettings, setDiscordSettings] = useState({
    guildId: "",
    channelId: "",
    enabled: false,
  })

  // Cargar MVPs y MVPs rastreados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener todos los MVPs
        const allMvps = getMVPs()
        setMvps(allMvps)

        // Obtener MVPs rastreados directamente del servidor
        const trackers = await refreshTrackersFromServer()

        // Filtrar por guildId si es necesario
        const filteredTrackers = trackers.filter((tracker) => tracker.guildId === guildId)

        setTrackedMvps(filteredTrackers)
      } catch (err) {
        setError(err.message)
        console.error("Error cargando datos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Configurar un intervalo para actualizar los datos cada 15 segundos
    const interval = setInterval(() => {
      fetchData()
    }, 15000)

    return () => clearInterval(interval)
  }, [guildId])

  // Cargar configuración de Discord desde localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("discordSettings")
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setDiscordSettings(settings)
        if (settings.enabled && settings.guildId) {
          setGuildId(settings.guildId)
          setChannelId(settings.channelId || "general")
        }
      } catch (e) {
        console.error("Error parsing saved Discord settings:", e)
      }
    }
  }, [])

  // Mostrar notificación temporal
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Guardar configuración de Discord
  const saveDiscordSettings = (settings) => {
    setDiscordSettings(settings)
    localStorage.setItem("discordSettings", JSON.stringify(settings))

    if (settings.enabled && settings.guildId) {
      setGuildId(settings.guildId)
      setChannelId(settings.channelId || "general")
    } else {
      setGuildId("web-interface")
      setChannelId("dashboard")
    }
  }

  // Función para marcar un MVP como matado
  const handleKill = async (mvpId: number, locationIndex: number, killerName = "Usuario Web") => {
    try {
      const targetGuildId = discordSettings.enabled ? discordSettings.guildId : "web-interface"
      const targetChannelId = discordSettings.enabled ? discordSettings.channelId : "dashboard"

      const response = await fetch("/api/track-mvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mvpId,
          guildId: targetGuildId,
          channelId: targetChannelId,
          locationIndex,
          killer: killerName,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al registrar la muerte del MVP")
      }

      // Actualizar la lista de MVPs rastreados desde el servidor
      const updatedTrackers = await refreshTrackersFromServer()
      const filteredTrackers = updatedTrackers.filter((tracker) => tracker.guildId === guildId)
      setTrackedMvps(filteredTrackers)

      showNotification("MVP registrado correctamente", "success")
    } catch (err) {
      setError(err.message)
      console.error("Error al registrar muerte:", err)
      showNotification("Error al registrar el MVP", "error")
    }
  }

  // Función para eliminar un MVP rastreado
  const handleDelete = async (mvpId: number, locationIndex: number) => {
    try {
      const targetGuildId = discordSettings.enabled ? discordSettings.guildId : "web-interface"
      const targetChannelId = discordSettings.enabled ? discordSettings.channelId : "dashboard"

      const response = await fetch("/api/remove-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mvpId,
          guildId: targetGuildId,
          channelId: targetChannelId,
          locationIndex,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el MVP rastreado")
      }

      // Actualizar la lista de MVPs rastreados desde el servidor
      const updatedTrackers = await refreshTrackersFromServer()
      const filteredTrackers = updatedTrackers.filter((tracker) => tracker.guildId === guildId)
      setTrackedMvps(filteredTrackers)

      showNotification("MVP eliminado correctamente", "success")
    } catch (err) {
      setError(err.message)
      console.error("Error al eliminar MVP:", err)
      showNotification("Error al eliminar el MVP", "error")
    }
  }

  // Función para enviar una notificación de prueba
  const handleTestNotification = async (mvpId: number, locationIndex: number) => {
    try {
      if (!discordSettings.enabled) {
        showNotification("Debes configurar Discord para enviar notificaciones", "error")
        return
      }

      const response = await fetch("/api/test-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mvpId,
          guildId: discordSettings.guildId,
          channelId: discordSettings.channelId,
          locationIndex,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al enviar la notificación de prueba")
      }

      showNotification("Notificación de prueba enviada correctamente", "success")
    } catch (err) {
      setError(err.message)
      console.error("Error al enviar notificación de prueba:", err)
      showNotification("Error al enviar la notificación de prueba", "error")
    }
  }

  if (loading) {
    return <div className="text-center py-10">Cargando datos de MVPs...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-8">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Configuración de Discord</h2>
        <DiscordSettings settings={discordSettings} onSave={saveDiscordSettings} />
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">MVPs Rastreados</h2>
        <TrackedMVPList
          trackedMvps={trackedMvps}
          mvps={mvps}
          onDelete={handleDelete}
          onTestNotification={handleTestNotification}
        />
        <div className="mt-4 text-right">
          <button
            onClick={async () => {
              const trackers = await refreshTrackersFromServer()
              const filteredTrackers = trackers.filter((tracker) => tracker.guildId === guildId)
              setTrackedMvps(filteredTrackers)
              showNotification("Datos actualizados", "success")
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Actualizar datos
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Todos los MVPs</h2>
        <MVPGrid mvps={mvps} onKill={handleKill} />
      </div>
    </div>
  )
}
