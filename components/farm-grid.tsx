"use client"

import { useEffect, useState } from "react"
import { Sprout, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FarmSlot, PlantModel } from "@/types"
import { getSocket } from "@/lib/socket-client"
import { apiRequest } from "@/lib/api"

interface FarmSlotWithPlant extends FarmSlot {
  plant_name?: string
  harvest_value?: number
  plant_image?: string
}

export function FarmGrid({ userId }: { userId: number }) {
  const [slots, setSlots] = useState<FarmSlotWithPlant[]>([])
  const [plants, setPlants] = useState<PlantModel[]>([])
  const [selectedSlot, setSelectedSlot] = useState<FarmSlotWithPlant | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSlots = async () => {
    try {
      const data = await apiRequest("/api/farm/slots")

      if (data.slots && data.slots.length === 0) {
        await apiRequest("/api/farm/init", { method: "POST" })
        const retryData = await apiRequest("/api/farm/slots")
        setSlots(retryData.slots || [])
      } else {
        setSlots(data.slots || [])
      }
    } catch (error) {
      console.error("[v0] Fetch slots error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlants = async () => {
    try {
      const data = await apiRequest("/api/farm/plants")
      setPlants(data.plants || [])
    } catch (error) {
      console.error("[v0] Fetch plants error:", error)
    }
  }

  useEffect(() => {
    fetchSlots()
    fetchPlants()

    const socket = getSocket()
    socket.emit("join-user-room", userId.toString())

    socket.on("farm-updated", () => {
      fetchSlots()
    })

    return () => {
      socket.off("farm-updated")
    }
  }, [userId])

  const handlePlant = async (plantId: number) => {
    if (!selectedSlot) return

    try {
      await apiRequest("/api/farm/plant", {
        method: "POST",
        body: JSON.stringify({ slotId: selectedSlot.id, plantId }),
      })

      setSelectedSlot(null)
      fetchSlots()

      const socket = getSocket()
      socket.emit("farm-update", { userId: userId.toString() })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to plant")
      console.error("[v0] Plant error:", error)
    }
  }

  const handleHarvest = async (slotId: number) => {
    try {
      const data = await apiRequest("/api/farm/harvest", {
        method: "POST",
        body: JSON.stringify({ slotId }),
      })

      alert(`Harvested! Earned $${data.earned}`)
      fetchSlots()

      const socket = getSocket()
      socket.emit("farm-update", { userId: userId.toString() })
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to harvest")
      console.error("[v0] Harvest error:", error)
    }
  }

  const getSlotStatus = (slot: FarmSlotWithPlant) => {
    if (!slot.plant_id) return "empty"
    if (slot.planted_at) {
      const plantedTime = new Date(slot.planted_at).getTime()
      const now = Date.now()
      const growTime = (slot.grow_time || 0) * 1000
      if (now - plantedTime >= growTime) return "ready"
    }
    return "growing"
  }

  const getTimeRemaining = (plantedAt: string, growTime: number) => {
    const planted = new Date(plantedAt).getTime()
    const ready = planted + growTime * 1000
    const now = new Date().getTime()
    const diff = Math.max(0, ready - now)
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (loading) {
    return <div className="text-center p-8">Loading farm...</div>
  }

  return (
    <>
      <div className="grid grid-cols-10 gap-1 p-4 bg-muted/30 rounded-lg">
        {slots.map((slot) => {
          const status = getSlotStatus(slot)

          return (
            <button
              key={slot.id}
              onClick={() => {
                if (status === "empty") {
                  setSelectedSlot(slot)
                } else if (status === "ready") {
                  handleHarvest(slot.id)
                }
              }}
              className={`aspect-square rounded border-2 flex items-center justify-center transition-all hover:scale-105 ${
                status === "empty"
                  ? "bg-background border-border hover:border-primary"
                  : status === "growing"
                    ? "bg-yellow-100 border-yellow-400"
                    : "bg-green-100 border-green-500 animate-pulse"
              }`}
              title={
                status === "empty"
                  ? "Empty slot - Click to plant"
                  : status === "growing"
                    ? `Growing ${slot.plant_name} - ${getTimeRemaining(slot.planted_at!, slot.grow_time!)}`
                    : `Ready to harvest ${slot.plant_name}!`
              }
            >
              {status === "empty" ? (
                <div className="size-4 rounded-full bg-muted" />
              ) : status === "growing" ? (
                <Sprout className="size-4 text-yellow-700" />
              ) : (
                <Sprout className="size-4 text-green-700" />
              )}
            </button>
          )
        })}
      </div>

      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Plant</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {plants.map((plant) => (
              <Card key={plant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{plant.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {plant.grow_time}s
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        Earn: ${plant.harvest_value}
                      </span>
                    </div>
                  </div>
                  <Button onClick={() => handlePlant(plant.id)} size="sm">
                    Plant (${plant.cost})
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
