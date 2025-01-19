import Head from 'next/head'
import { useWeather } from '../hooks/useWeather'
import { WeatherInfo } from '../components/WeatherInfo'

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
        <h1>등산 날씨 정보</h1>
        {loading && <p>날씨 정보를 불러오는 중...</p>}
        {error && <p className="error">{error}</p>}
        {weather && <WeatherInfo weather={weather} />}
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