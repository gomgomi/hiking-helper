import { WeatherData } from '../types/weather';

interface WeatherInfoProps {
  weather: WeatherData;
}

const getWindDirection = (deg: number): string => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  return directions[Math.round(deg / 45) % 8];
};

export const WeatherInfo = ({ weather }: WeatherInfoProps) => {
  return (
    <div className="weather-info">
      <div className="location-info">
        <h2>{weather.location}</h2>
        <p className="description">{weather.description}</p>
      </div>
      <div className="weather-grid">
        <div className="weather-item">
          <h3>기온</h3>
          <p>{weather.temp.toFixed(1)}°C</p>
        </div>
        <div className="weather-item">
          <h3>습도</h3>
          <p>{weather.humidity}%</p>
        </div>
        <div className="weather-item">
          <h3>풍속</h3>
          <p>{weather.windSpeed}m/s</p>
        </div>
        <div className="weather-item">
          <h3>풍향</h3>
          <p>{getWindDirection(weather.windDeg)}</p>
        </div>
        <div className="weather-item">
          <h3>강수량</h3>
          <p>{weather.precipitation}mm/h</p>
        </div>
      </div>

      <style jsx>{`
        .weather-info {
          background: white;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
        }
        .location-info {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .location-info h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }
        .description {
          color: #666;
          margin: 0.5rem 0 0;
        }
        .weather-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 1rem;
        }
        .weather-item {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
        }
        .weather-item h3 {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        .weather-item p {
          margin: 0.5rem 0 0;
          font-size: 1.2rem;
          font-weight: bold;
          color: #333;
        }
      `}</style>
    </div>
  );
}; 