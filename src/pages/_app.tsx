import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import '../styles/globals.css'

function HikingHelper({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
      })
    }
  }, [])

  return <Component {...pageProps} />
}

export default HikingHelper 