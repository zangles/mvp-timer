import { mvps } from "@/data/mvps"
import type { MVP, MVPTracker, Location } from "@/types/mvp"
import { loadTrackers, saveTrackers, saveTrackersToServer } from "./storage-service"

// Función para obtener todos los MVPs
export function getMVPs(): MVP[] {
  return mvps
}

// Función para obtener un MVP por ID
export function getMVPById(id: number): MVP | undefined {
  return mvps.find((mvp) => mvp.id === id)
}

// Función para obtener un MVP por nombre
export function getMVPByName(name: string): MVP | undefined {
  if (!name) return undefined
  return mvps.find((mvp) => mvp.name.toLowerCase() === name.toLowerCase())
}

// Función para obtener todos los trackers
export async function getTrackers(): Promise<MVPTracker[]> {
  try {
    return await loadTrackers()
  } catch (error) {
    console.error("Error getting trackers:", error)
    return []
  }
}

// Función para guardar todos los trackers
export async function saveAllTrackers(trackers: MVPTracker[]): Promise<void> {
  try {
    await saveTrackers(trackers)
    // También intentamos guardar en el servidor si estamos en el cliente
    if (typeof window !== "undefined") {
      await saveTrackersToServer(trackers)
    }
  } catch (error) {
    console.error("Error saving trackers:", error)
  }
}

// Función para obtener el tiempo de respawn de una ubicación específica
export function getLocationRespawnTime(mvp: MVP, locationIndex: number): number {
  if (locationIndex < 0 || locationIndex >= mvp.locations.length) {
    return mvp.respawnTime
  }

  const location = mvp.locations[locationIndex]
  return location.respawnTime !== undefined ? location.respawnTime : mvp.respawnTime
}

// Función para rastrear un MVP
export async function trackMVP(
  mvpId: number,
  guildId: string,
  channelId: string,
  locationIndex = 0,
  killedBy?: string,
): Promise<MVPTracker> {
  console.log(
    `Tracking MVP ID: ${mvpId}, Guild: ${guildId}, Channel: ${channelId}, Location: ${locationIndex}, Killer: ${killedBy}`,
  )

  const mvp = getMVPById(mvpId)
  if (!mvp) {
    throw new Error(`MVP with ID ${mvpId} not found`)
  }

  // Verificar que el índice de ubicación sea válido
  if (locationIndex < 0 || locationIndex >= mvp.locations.length) {
    throw new Error(`Invalid location index ${locationIndex} for MVP ${mvp.name}`)
  }

  // Obtener el tiempo de respawn específico para esta ubicación
  const respawnTime = getLocationRespawnTime(mvp, locationIndex)

  const now = new Date()
  const expectedRespawn = new Date(now.getTime() + respawnTime * 60 * 1000)

  const tracker: MVPTracker = {
    mvpId,
    guildId,
    channelId,
    lastKilled: now,
    expectedRespawn,
    killedBy,
    locationIndex,
  }

  const trackers = await getTrackers()

  // Check if this MVP is already being tracked in this guild/channel/location
  const existingIndex = trackers.findIndex(
    (t) => t.mvpId === mvpId && t.guildId === guildId && t.channelId === channelId && t.locationIndex === locationIndex,
  )

  if (existingIndex >= 0) {
    trackers[existingIndex] = tracker
  } else {
    trackers.push(tracker)
  }

  await saveAllTrackers(trackers)
  console.log(`MVP ${mvp.name} tracked successfully. Total trackers: ${trackers.length}`)

  return tracker
}

// Función para obtener MVPs rastreados por guildId
export async function getTrackedMVPs(guildId: string, channelId?: string): Promise<MVPTracker[]> {
  const trackers = await getTrackers()
  console.log(`Getting tracked MVPs for guild ${guildId}. Total trackers: ${trackers.length}`)
  return trackers.filter((t) => t.guildId === guildId && (!channelId || t.channelId === channelId))
}

// Función para formatear el tiempo de respawn
export function formatRespawnTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()

  if (diff <= 0) {
    return "Ready to spawn!"
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}

// Función para obtener el nombre de la ubicación formateado
export function formatLocation(location: Location): string {
  return `${location.map} (${location.x}, ${location.y})`
}

// Función para eliminar un tracker específico
export async function removeTracker(
  mvpId: number,
  guildId: string,
  channelId: string,
  locationIndex = 0,
): Promise<boolean> {
  try {
    const trackers = await getTrackers()

    // Encontrar el índice del tracker que queremos eliminar
    const trackerIndex = trackers.findIndex(
      (t) =>
        t.mvpId === mvpId && t.guildId === guildId && t.channelId === channelId && t.locationIndex === locationIndex,
    )

    // Si no encontramos el tracker, retornar false
    if (trackerIndex === -1) {
      return false
    }

    // Eliminar el tracker del array
    trackers.splice(trackerIndex, 1)

    // Guardar los trackers actualizados
    await saveAllTrackers(trackers)

    return true
  } catch (error) {
    console.error("Error removing tracker:", error)
    return false
  }
}
