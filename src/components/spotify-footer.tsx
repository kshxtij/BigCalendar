"use client"

import { useState, useEffect } from "react"
import { invoke } from "@tauri-apps/api/core"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import spotifyLogo from "@/assets/spotify.svg"
import { useSidebar } from "@/components/ui/sidebar"

interface RecentlyPlayedSong {
  is_playing: boolean
  title: string
  artist: string
  album: string
  album_image_url: string
  song_url: string
}

export function CurrentlyPlayingSidebarFooter() {
  const [data, setData] = useState<RecentlyPlayedSong | null>(null)
  const [isEnabled, setIsEnabled] = useState(true)

  const { state } = useSidebar()

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const fetchData = async () => {
      if (!isEnabled) return

      try {
        const apiData: RecentlyPlayedSong = await invoke("get_currently_playing_song")
        if (apiData.is_playing === false) {
          setData({
            is_playing: false,
            title: "IDLE",
            artist: "Nothing playing",
            album: "",
            album_image_url: spotifyLogo,
            song_url: "",
          })
        }
        else if (apiData.title !== data?.title) {
          setData(apiData)
        }
      } catch (error) {
        console.error("Error fetching Spotify data:", error)
      }
    }

    if (isEnabled) {
      fetchData() // Fetch immediately when enabled
      intervalId = setInterval(fetchData, 10000) // Then every 10 seconds
    } else {
      // setData(null) // Clear data when disabled
      setData({
        is_playing: false,
        title: "DISABLED",
        artist: "",
        album: "",
        album_image_url: spotifyLogo,
        song_url: "",
      })
    }

    return () => {
      if (intervalId) clearInterval(intervalId) // Cleanup on unmount or when disabled
    }
  }, [isEnabled, data?.title])

  if (state === "collapsed") {
    return (
      <footer className="p-1">
        <div className="flex flex-col space-y-2">
          <Avatar className="h-6 w-6 rounded-md">
            <AvatarImage src={spotifyLogo} alt="spotify" className="object-cover" />
            <AvatarFallback className="rounded-md bg-gray-300 dark:bg-gray-600">
              {data?.title ? data.title[0] : 'S'}
            </AvatarFallback>
          </Avatar>
          {data?.is_playing ? (
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarImage src={data?.album_image_url} alt={data?.title} className="object-cover" />
              <AvatarFallback className="rounded-md bg-gray-300 dark:bg-gray-600">
                {data?.title ? data.title[0] : 'S'}
              </AvatarFallback>
            </Avatar>) : null}
        </div>
      </footer>
    )
  } else {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <footer className="bg-sidebar p-4">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="spotify-toggle" className="text-xs text-sidebar-foreground/70">
                Enable Spotify Integration
              </Label>
              <Switch
                id="spotify-toggle"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 rounded-md">
                <AvatarImage src={data?.album_image_url} alt={data?.title} className="object-cover" />
                <AvatarFallback className="rounded-md">{data?.title[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground">{data?.title ? data?.title?.length > 17 ? data?.title.slice(0, 17) + "..." : data?.title : "Nothing playing"}</span>
                <span className="text-sm text-sidebar-foreground/70">{data?.artist ? data?.artist?.length > 20 ? data?.artist.slice(0, 17) + "..." : data?.artist : ""}</span>
              </div>
            </div>
          </footer>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }
}

