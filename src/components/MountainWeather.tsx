import { useState, useEffect } from 'react';
import { useWeather } from '../hooks/useWeather';
import { mountains } from '../data/mountains';
import { Mountain } from '../types/mountain';

export const MountainWeather = () => {
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null);
  const { weather, loading, error } = useWeather(selectedMountain);

  useEffect(() => {
    // 컴포넌트 마운트 시 첫 번째 산으로 초기화
    if (mountains.length > 0) {
      setSelectedMountain(mountains[0]);
    }
  }, []);

  // 디버깅을 위한 로그
  console.log('현재 선택된 산:', selectedMountain);
  console.log('날씨 데이터:', weather);
  console.log('로딩 상태:', loading);
  console.log('에러:', error);

  if (!selectedMountain) return <div>산 데이터를 불러오는 중...</div>;
  if (loading) return <div>날씨 정보를 불러오는 중...</div>;
  if (error) return <div>에러: {error}</div>;
  if (!weather) return <div>날씨 정보가 없습니다.</div>;

  return (
    <div className="p-4">
      <select 
        className="mb-4 p-2 border rounded"
        value={selectedMountain.name}
        onChange={(e) => {
          const mountain = mountains.find(m => m.name === e.target.value);
          if (mountain) {
            console.log('산 변경:', mountain);
            setSelectedMountain(mountain);
          }
        }}
      >
        {mountains.map(mountain => (
          <option key={mountain.name} value={mountain.name}>
            {mountain.name} ({mountain.height}m) - {mountain.region}
          </option>
        ))}
      </select>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">
          {selectedMountain.name} ({selectedMountain.height}m)
        </h2>
        <p className="mb-2">지역: {selectedMountain.region}</p>
        <p className="mb-2">기온: {weather.temp}°C</p>
        <p className="mb-2">습도: {weather.humidity}%</p>
        <p className="mb-2">풍속: {weather.windSpeed}m/s</p>
        <p className="mb-2">날씨: {weather.description}</p>
        <p className="text-sm text-gray-500">
          좌표: {selectedMountain.latitude}, {selectedMountain.longitude}
        </p>
      </div>
    </div>
  );
}; 