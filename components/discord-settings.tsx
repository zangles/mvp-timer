"use client"

import { useState } from "react"

interface DiscordSettingsProps {
  settings: {
    guildId: string
    channelId: string
    enabled: boolean
  }
  onSave: (settings: any) => void
}

export function DiscordSettings({ settings, onSave }: DiscordSettingsProps) {
  const [formData, setFormData] = useState({
    guildId: settings.guildId || "",
    channelId: settings.channelId || "",
    enabled: settings.enabled || false,
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="bg-white p-4 rounded-md">
        {formData.enabled ? (
          <div>
            <p className="text-green-600 font-medium mb-2">✓ Las notificaciones se enviarán a Discord</p>
            <p className="text-sm text-gray-600">
              Servidor ID: {formData.guildId}
              <br />
              Canal ID: {formData.channelId || "general"}
            </p>
          </div>
        ) : (
          <p className="text-gray-600">
            Las notificaciones no se enviarán a Discord. Configura tu servidor para activarlas.
          </p>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
        >
          Editar configuración
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md">
      <div className="mb-4">
        <label className="flex items-center">
          <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleChange} className="mr-2" />
          <span>Enviar notificaciones a Discord</span>
        </label>
      </div>

      {formData.enabled && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Servidor (Guild ID)</label>
            <input
              type="text"
              name="guildId"
              value={formData.guildId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ej: 123456789012345678"
              required={formData.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes obtener el ID del servidor haciendo clic derecho en el servidor y seleccionando "Copiar ID"
              (necesitas el modo desarrollador activado).
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">ID del Canal (Channel ID)</label>
            <input
              type="text"
              name="channelId"
              value={formData.channelId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ej: 123456789012345678"
              required={formData.enabled}
            />
            <p className="text-xs text-gray-500 mt-1">
              Puedes obtener el ID del canal haciendo clic derecho en el canal y seleccionando "Copiar ID".
            </p>
          </div>
        </>
      )}

      <div className="flex space-x-2">
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
