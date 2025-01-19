import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '날씨 앱',
    short_name: '날씨',
    description: '현재 위치의 날씨 정보를 제공하는 앱입니다.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
}

export const metadata = {
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192x192.png',
  }
}