import { useState, useEffect } from 'react';
import { mountains } from '../data/mountains';
import { Mountain } from '../types/mountain';
import { WeatherData } from '../types/weather';
import { convertToGridCoord, getWeatherDescription } from '../utils/weatherUtils';

interface MountainWeatherInfo {
  mountain: Mountain;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export const MountainWeatherList = () => {
  const [mountainWeathers, setMountainWeathers] = useState<MountainWeatherInfo[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');

  // 고유한 지역 목록 생성
  const regions = ['전체', ...new Set(mountains.map(m => m.region))];

  useEffect(() => {
    // 각 산에 대한 날씨 정보 초기화
    const initialWeathers = mountains.map(mountain => ({
      mountain,
      weather: null,
      loading: true,
      error: null
    }));
    setMountainWeathers(initialWeathers);

    // 각 산의 날씨 정보를 개별적으로 가져오기
    mountains.forEach(async (mountain, index) => {
      try {
        const dfsXY = convertToGridCoord(mountain.latitude, mountain.longitude);
        console.log(`${mountain.name} 격자 좌표:`, dfsXY);

        const baseUrl = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
        const serviceKey = process.env.NEXT_PUBLIC_KMA_API_KEY;
        
        // 현재 시간 기준으로 baseDate와 baseTime 설정
        const now = new Date();
        const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
        
        // 현재 시각에서 한 시간 전의 정각 시간을 구함
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        now.setHours(now.getHours() - 1);
        const baseTime = now.getHours().toString().padStart(2, '0') + '00';

        const url = `${baseUrl}?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&base_date=${baseDate}&base_time=${baseTime}&nx=${dfsXY.x}&ny=${dfsXY.y}&dataType=JSON`;
        
        console.log(`${mountain.name} API 요청:`, {
          산: mountain.name,
          날짜: baseDate,
          시간: baseTime,
          격자X: dfsXY.x,
          격자Y: dfsXY.y
        });

        const response = await fetch(url);
        const data = await response.json();

        console.log(`${mountain.name} API 응답:`, data);

        // API 응답 구조 확인 및 에러 처리
        if (data.response?.header?.resultCode !== '00') {
          throw new Error(data.response?.header?.resultMsg || '기상청 API 오류');
        }

        if (!data.response?.body?.items?.item || data.response.body.items.item.length === 0) {
          throw new Error('해당 지역의 날씨 데이터가 없습니다');
        }

        const items = data.response.body.items.item;
        const weatherData: { [key: string]: number } = {};
        
        items.forEach((item: any) => {
          weatherData[item.category] = Number(item.obsrValue);
        });

        // 필수 날씨 데이터 확인
        const requiredCategories = ['T1H', 'REH', 'WSD', 'PTY'];
        const missingCategories = requiredCategories.filter(category => !(category in weatherData));
        
        if (missingCategories.length > 0) {
          throw new Error(`누락된 날씨 정보: ${missingCategories.join(', ')}`);
        }

        setMountainWeathers(prev => prev.map((mw, i) => 
          i === index ? {
            ...mw,
            weather: {
              temp: weatherData.T1H,
              humidity: weatherData.REH,
              windSpeed: weatherData.WSD,
              windDeg: weatherData.VEC || 0,
              precipitation: weatherData.RN1 || 0,
              description: getWeatherDescription(weatherData.PTY),
              location: mountain.name
            },
            loading: false,
            error: null
          } : mw
        ));
      } catch (err) {
        console.error(`${mountain.name} 날씨 조회 실패:`, err);
        setMountainWeathers(prev => prev.map((mw, i) => 
          i === index ? {
            ...mw,
            loading: false,
            error: err instanceof Error ? err.message : '날씨 정보를 가져오는데 실패했습니다.'
          } : mw
        ));
      }
    });
  }, []);

  const filteredMountains = mountainWeathers.filter(mw => 
    selectedRegion === '전체' || mw.mountain.region === selectedRegion
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <select 
          className="p-2 border rounded"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMountains.map(({ mountain, weather, loading, error }) => (
          <div key={mountain.name} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{mountain.name}</h2>
            <p className="text-gray-600 mb-2">{mountain.region}</p>
            <p className="mb-2">고도: {mountain.height}m</p>
            
            {loading && <p>로딩 중...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {weather && (
              <>
                <p>기온: {weather.temp}°C</p>
                <p>습도: {weather.humidity}%</p>
                <p>풍속: {weather.windSpeed}m/s</p>
                <p>날씨: {weather.description}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 