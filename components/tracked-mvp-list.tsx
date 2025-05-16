"use client"

import { useState } from "react"
import type { MVP, MVPTracker } from "@/types/mvp"
import { formatRespawnTime, formatLocation } from "@/lib/mvp-service"
import { Trash2, Bell } from "lucide-react"

interface TrackedMVPListProps {
  trackedMvps: MVPTracker[]
  mvps: MVP[]
  onDelete: (mvpId: number, locationIndex: number) => void
  onTestNotification: (mvpId: number, locationIndex: number) => void
}

export function TrackedMVPList({ trackedMvps, mvps, onDelete, onTestNotification }: TrackedMVPListProps) {
  const [sortBy, setSortBy] = useState<"name" | "respawn">("respawn")
  const [isDeleting, setIsDeleting] = useState<{ mvpId: number; locationIndex: number } | null>(null)
  const [isSendingNotification, setIsSendingNotification] = useState<{ mvpId: number; locationIndex: number } | null>(
    null,
  )

  // Función para obtener el objeto MVP completo a partir del ID
  const getMvpById = (id: number): MVP | undefined => {
    return mvps.find((mvp) => mvp.id === id)
  }

  // Ordenar MVPs rastreados
  const sortedMvps = [...trackedMvps].sort((a, b) => {
    if (sortBy === "name") {
      const mvpA = getMvpById(a.mvpId)
      const mvpB = getMvpById(b.mvpId)
      return mvpA && mvpB ? mvpA.name.localeCompare(mvpB.name) : 0
    } else {
      return new Date(a.expectedRespawn).getTime() - new Date(b.expectedRespawn).getTime()
    }
  })

  // Manejar eliminación de un MVP
  const handleDelete = (mvpId: number, locationIndex: number) => {
    setIsDeleting({ mvpId, locationIndex })
  }

  // Confirmar eliminación
  const confirmDelete = () => {
    if (isDeleting) {
      onDelete(isDeleting.mvpId, isDeleting.locationIndex)
      setIsDeleting(null)
    }
  }

  // Manejar envío de notificación de prueba
  const handleTestNotification = (mvpId: number, locationIndex: number) => {
    setIsSendingNotification({ mvpId, locationIndex })
    onTestNotification(mvpId, locationIndex)

    // Resetear el estado después de un breve retraso
    setTimeout(() => {
      setIsSendingNotification(null)
    }, 2000)
  }

  if (trackedMvps.length === 0) {
    return <div className="text-center py-4">No hay MVPs rastreados actualmente.</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setSortBy("respawn")}
            className={`px-3 py-1 rounded ${sortBy === "respawn" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Ordenar por tiempo
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 rounded ${sortBy === "name" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Ordenar por nombre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedMvps.map((tracker) => {
          const mvp = getMvpById(tracker.mvpId)
          if (!mvp) return null

          const locationIndex = tracker.locationIndex !== undefined ? tracker.locationIndex : 0
          const location = mvp.locations[locationIndex]

          if (!location) return null

          const respawnTime = formatRespawnTime(new Date(tracker.expectedRespawn))
          const isReadyToSpawn = respawnTime === "Ready to spawn!"

          return (
            <div
              key={`${tracker.mvpId}-${tracker.guildId}-${locationIndex}`}
              className={`border rounded-lg p-4 ${isReadyToSpawn ? "bg-green-100 border-green-300" : "bg-white border-gray-200"}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 relative flex-shrink-0 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                  {mvp.imageUrl ? (
                    <img
                      src={mvp.imageUrl || "/placeholder.svg"}
                      alt={mvp.name}
                      className="max-w-full max-h-full"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="text-xs text-gray-500">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{mvp.name}</h3>
                  <p className={`text-sm ${isReadyToSpawn ? "text-green-700 font-bold" : "text-gray-600"}`}>
                    {respawnTime}
                  </p>
                  <p className="text-xs text-gray-500">Matado por: {tracker.killedBy || "Desconocido"}</p>
                  <p className="text-xs text-gray-500">Ubicación: {formatLocation(location)}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleTestNotification(tracker.mvpId, locationIndex)}
                    disabled={!!isSendingNotification}
                    className={`p-1.5 rounded-full ${
                      isSendingNotification?.mvpId === tracker.mvpId &&
                      isSendingNotification?.locationIndex === locationIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 hover:bg-blue-500 hover:text-white"
                    } transition-colors`}
                    title="Probar notificación"
                  >
                    <Bell size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(tracker.mvpId, locationIndex)}
                    className="p-1.5 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de confirmación para eliminar */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-4">¿Estás seguro de que deseas eliminar este MVP rastreado?</p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleting(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
