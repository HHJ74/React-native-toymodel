import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function MapScreen() {
  const [buildings, setBuildings] = useState([]);
  const [region, setRegion] = useState({
    latitude: 37.44, // 초기 중심 좌표
    longitude: 127.88,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // API 호출 함수 (중심 좌표 기반)
  const fetchBuildings = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `http://192.168.0.51:8080/bldg/nearby?x=${longitude}&y=${latitude}&radius=200`
      );
      const data = await response.json();
      console.log('API 데이터:', data);
      setBuildings(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  // 초기 로드 시 API 호출
  useEffect(() => {
    fetchBuildings(region.latitude, region.longitude);
  }, []);

  // 지도 이동 완료 시 호출
  const handleRegionChangeComplete = (newRegion) => {
    setRegion(newRegion); // 새로운 중심 좌표 업데이트
    fetchBuildings(newRegion.latitude, newRegion.longitude); // API 재호출
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete} // 지도 이동 시 호출
      >
        {buildings.map((building, index) => {
          const coords = building.bldg_geom.coordinates[0][0];
          const firstCoord = coords[0];
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: firstCoord[1],
                longitude: firstCoord[0],
              }}
              title={building.bldg_nm || '이름 없음'}
              description={building.road_nm_addr}
            />
          );
        })}

        {buildings.map((building, index) => {
          const coords = building.bldg_geom.coordinates[0][0];
          return (
            <Polygon
              key={`polygon-${index}`}
              coordinates={coords.map(([longitude, latitude]) => ({
                latitude,
                longitude,
              }))}
              strokeColor="#F00"
              fillColor="rgba(255,0,0,0.3)"
              strokeWidth={2}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});