import type { MVPTracker } from "@/types/mvp"

// Caché en memoria para el servidor
let serverMemoryCache: MVPTracker[] = []

// Función para cargar trackers
export async function loadTrackers(): Promise<MVPTracker[]> {
  try {
    // En el cliente, primero intentamos obtener del servidor
    if (typeof window !== "undefined") {
      try {
        // Intentar obtener datos del servidor primero
        const response = await fetch("/api/trackers")
        if (response.ok) {
          const data = await response.json()
          if (data.success && Array.isArray(data.trackers)) {
            // Convertir las fechas de string a Date
            const trackers = data.trackers.map((tracker) => ({
              ...tracker,
              lastKilled: new Date(tracker.lastKilled),
              expectedRespawn: new Date(tracker.expectedRespawn),
            }))

            // Guardar en localStorage para respaldo
            localStorage.setItem("mvp-trackers", JSON.stringify(trackers))

            return trackers
          }
        }
      } catch (error) {
        console.error("Error fetching from server, falling back to localStorage:", error)
      }

      // Si falla la obtención del servidor, usar localStorage como respaldo
      const stored = localStorage.getItem("mvp-trackers")
      if (stored) {
        const trackers = JSON.parse(stored) as MVPTracker[]
        return trackers.map((tracker) => ({
          ...tracker,
          lastKilled: new Date(tracker.lastKilled),
          expectedRespawn: new Date(tracker.expectedRespawn),
        }))
      }
      return []
    }

    // En el servidor, usamos la caché en memoria
    return serverMemoryCache
  } catch (error) {
    console.error("Error loading trackers:", error)
    return []
  }
}

// Función para guardar trackers
export async function saveTrackers(trackers: MVPTracker[]): Promise<void> {
  try {
    // En el cliente, guardamos en localStorage y enviamos al servidor
    if (typeof window !== "undefined") {
      // Guardar en localStorage
      localStorage.setItem("mvp-trackers", JSON.stringify(trackers))

      // Enviar al servidor
      try {
        await fetch("/api/trackers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trackers }),
        })
      } catch (error) {
        console.error("Error saving to server:", error)
      }
    } else {
      // En el servidor, guardamos en la caché en memoria
      serverMemoryCache = trackers
    }
  } catch (error) {
    console.error("Error saving trackers:", error)
  }
}

// Función para obtener trackers del servidor (forzar actualización)
export async function refreshTrackersFromServer(): Promise<MVPTracker[]> {
  if (typeof window === "undefined") {
    return serverMemoryCache
  }

  try {
    const response = await fetch("/api/trackers?_=" + new Date().getTime())
    if (!response.ok) {
      throw new Error("Error fetching trackers from server")
    }
    const data = await response.json()
    if (!data.success || !Array.isArray(data.trackers)) {
      throw new Error("Invalid response from server")
    }

    // Convertir las fechas de string a Date
    const trackers = data.trackers.map((tracker) => ({
      ...tracker,
      lastKilled: new Date(tracker.lastKilled),
      expectedRespawn: new Date(tracker.expectedRespawn),
    }))

    // Actualizar localStorage
    localStorage.setItem("mvp-trackers", JSON.stringify(trackers))

    return trackers
  } catch (error) {
    console.error("Error refreshing trackers from server:", error)
    // Fallback a localStorage
    const stored = localStorage.getItem("mvp-trackers")
    if (stored) {
      const trackers = JSON.parse(stored) as MVPTracker[]
      return trackers.map((tracker) => ({
        ...tracker,
        lastKilled: new Date(tracker.lastKilled),
        expectedRespawn: new Date(tracker.expectedRespawn),
      }))
    }
    return []
  }
}

export async function saveTrackersToServer(trackers: MVPTracker[]): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      await fetch("/api/trackers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackers }),
      })
    }
  } catch (error) {
    console.error("Error saving trackers to server:", error)
  }
}
