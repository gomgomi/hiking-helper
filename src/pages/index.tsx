import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Home() {
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)

  return (
    <div>
      <Head>
        <title>등산 날씨</title>
        <meta name="description" content="등산객을 위한 날씨 정보" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main>
        <h1>등산 날씨 정보</h1>
        {/* 날씨 정보 표시 영역 */}
      </main>
    </div>
  )
} 