import Head from 'next/head'
import { useWeather } from '../hooks/useWeather'
import { WeatherInfo } from '../components/WeatherInfo'
import { MountainWeatherList } from '../components/MountainWeatherList'

export default function Home() {
  const { weather, loading, error } = useWeather();

  return (
    <div className="container">
      <Head>
        <title>등산 날씨</title>
        <meta name="description" content="등산객을 위한 날씨 정보" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold text-center my-4">
          100대 명산 날씨 정보
        </h1>
        <MountainWeatherList />
      </main>

      <style jsx>{`
        .container {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
        }
        .error {
          color: red;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 