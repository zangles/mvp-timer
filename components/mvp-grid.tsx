"use client"

import { useState } from "react"
import type { MVP } from "@/types/mvp"
import { formatLocation, getLocationRespawnTime } from "@/lib/mvp-service"

interface MVPGridProps {
  mvps: MVP[]
  onKill: (mvpId: number, locationIndex: number, killerName?: string) => void
}

export function MVPGrid({ mvps, onKill }: MVPGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [killerName, setKillerName] = useState("")
  const [selectedMvp, setSelectedMvp] = useState<{ mvp: MVP; locationIndex: number } | null>(null)

  // Filtrar MVPs por término de búsqueda
  const filteredMvps = mvps.filter((mvp) => mvp.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Manejar el registro de muerte
  const handleKillConfirm = () => {
    if (selectedMvp) {
      onKill(selectedMvp.mvp.id, selectedMvp.locationIndex, killerName || "Usuario Web")
      setSelectedMvp(null)
      setKillerName("")
    }
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar MVP por nombre..."
          className="w-full p-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMvps.map((mvp) => (
          <div
            key={mvp.id}
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-2">
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
              <div>
                <h3 className="font-bold">{mvp.name}</h3>
              </div>
            </div>

            <div className="text-sm mb-3">
              <p>Respawn predeterminado: {mvp.respawnTime} minutos</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ubicaciones:</p>
              {mvp.locations.map((location, index) => {
                const respawnTime = location.respawnTime || mvp.respawnTime
                return (
                  <div key={`${mvp.id}-location-${index}`} className="border border-gray-100 rounded p-2 bg-gray-50">
                    <p className="text-xs mb-1">{formatLocation(location)}</p>
                    <p className="text-xs mb-2">
                      {location.respawnTime ? `Respawn: ${location.respawnTime} minutos` : "Respawn: predeterminado"}
                    </p>
                    <button
                      onClick={() => setSelectedMvp({ mvp, locationIndex: index })}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded text-sm transition-colors"
                    >
                      Matado
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para confirmar muerte */}
      {selectedMvp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Registrar muerte de {selectedMvp.mvp.name}</h3>
            <p className="mb-2 text-sm">
              Ubicación: {formatLocation(selectedMvp.mvp.locations[selectedMvp.locationIndex])}
            </p>
            <p className="mb-4 text-sm">
              Tiempo de respawn: {getLocationRespawnTime(selectedMvp.mvp, selectedMvp.locationIndex)} minutos
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Quién lo mató?</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Tu nombre (opcional)"
                value={killerName}
                onChange={(e) => setKillerName(e.target.value)}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleKillConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Confirmar
              </button>
              <button
                onClick={() => setSelectedMvp(null)}
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
