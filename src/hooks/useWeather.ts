import { useState, useEffect } from 'react';
import { WeatherData } from '../types/weather';
import { Mountain } from '../types/mountain';

export const useWeather = (mountain?: Mountain | null) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number, locationName?: string) => {
      try {
        const dfsXY = convertToGridCoord(lat, lon);
        console.log('격자 좌표:', dfsXY);
        
        const baseUrl = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
        const serviceKey = process.env.NEXT_PUBLIC_KMA_API_KEY;
        const today = new Date();
        const baseDate = today.toISOString().slice(0, 10).replace(/-/g, '');
        const baseTime = `${String(today.getHours()-1).padStart(2, '0')}00`;

        const url = `${baseUrl}?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&base_date=${baseDate}&base_time=${baseTime}&nx=${dfsXY.x}&ny=${dfsXY.y}&dataType=JSON`;
        
        console.log('API 요청:', {
          위치: locationName,
          위도: lat,
          경도: lon,
          격자X: dfsXY.x,
          격자Y: dfsXY.y
        });

        const response = await fetch(url);
        const data = await response.json();

        if (!data.response?.body?.items?.item) {
          throw new Error('날씨 데이터가 없습니다');
        }

        const items = data.response.body.items.item;
        const weatherData: { [key: string]: number } = {};
        
        items.forEach((item: any) => {
          weatherData[item.category] = Number(item.obsrValue);
        });

        setWeather({
          temp: weatherData.T1H,
          humidity: weatherData.REH,
          windSpeed: weatherData.WSD,
          windDeg: weatherData.VEC,
          precipitation: weatherData.RN1,
          description: getWeatherDescription(weatherData.PTY),
          location: locationName || `${dfsXY.x},${dfsXY.y}`
        });
      } catch (err) {
        console.error('날씨 정보 조회 실패:', err);
        setError('날씨 정보를 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (mountain) {
      // 산 정보가 있는 경우 해당 산의 날씨 정보를 가져옴
      console.log('산 날씨 요청:', mountain.name);
      fetchWeather(mountain.latitude, mountain.longitude, mountain.name);
    } else if (navigator.geolocation) {
      // 산 정보가 없는 경우 현재 위치의 날씨 정보를 가져옴
      console.log('현재 위치 날씨 요청');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('위치 정보를 가져올 수 없습니다.');
          setLoading(false);
        }
      );
    } else {
      setError('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      setLoading(false);
    }
  }, [mountain]); // mountain이 변경될 때마다 useEffect 실행

  return { weather, loading, error };
};

// 위경도를 기상청 격자 좌표로 변환하는 함수
const convertToGridCoord = (lat: number, lon: number) => {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + (lat) * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { x, y };
};

// 강수형태 코드를 설명으로 변환하는 함수
const getWeatherDescription = (ptyCode: number): string => {
  const descriptions: { [key: number]: string } = {
    0: '맑음',
    1: '비',
    2: '비/눈',
    3: '눈',
    4: '소나기',
    5: '빗방울',
    6: '빗방울/눈날림',
    7: '눈날림'
  };
  return descriptions[ptyCode] || '알 수 없음';
};

// 위경도로 위치명을 가져오는 함수
const getLocationName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_API_KEY}`,
          'Content-Type': 'application/json;charset=UTF-8',
          'origin': window.location.origin
        }
      }
    );
    const data = await response.json();

    console.log('카카오 API 응답:', data);

    if (data.documents && data.documents[0]) {
      const address = data.documents[0].address;
      return `${address.region_1depth_name} ${address.region_2depth_name}`;
    }
    return '알 수 없는 위치';
  } catch (error) {
    console.error('위치 정보 변환 실패:', error);
    return '위치 확인 불가';
  }
}; 