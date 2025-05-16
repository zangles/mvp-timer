export interface Location {
  map: string
  x: number
  y: number
  respawnTime?: number // Tiempo de respawn específico para esta ubicación (en minutos)
}

export interface MVP {
  id: number
  name: string
  respawnTime: number // Tiempo de respawn predeterminado (en minutos)
  locations: Location[]
  imageUrl?: string
}

export interface MVPTracker {
  mvpId: number
  guildId: string
  channelId: string
  lastKilled: Date
  expectedRespawn: Date
  killedBy?: string
  notifiedAt?: number
  locationIndex?: number // Índice de la ubicación donde fue matado
}
