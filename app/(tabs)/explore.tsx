import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapStore } from '@/stores/mapStore';


export default function MapScreen() {
  const { region, polygons, setRegion, fetchPolygons } = useMapStore(); // zustand 상태와 함수 가져오기
  const [isLoading, setIsLoading] = useState(false);


  // 초기 위치 가져오기
  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }


      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.02,
      });
    }
    getCurrentLocation();
  }, []);


  // 버튼 클릭 핸들러
  const handleButtonPress = async () => {
    if (!region) return;


    setIsLoading(true);
    await fetchPolygons(region.latitude, region.longitude); // zustand에서 fetchPolygons 호출
    setIsLoading(false);
  };


  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)} // 지도 이동 시 중심 좌표 업데이트
      >
        {polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            coordinates={polygon.coordinates}
            strokeColor="#FF0000" // 폴리곤 테두리 색상
            fillColor="rgba(255,0,0,0.3)" // 폴리곤 내부 색상 (반투명)
            strokeWidth={2}
          />
        ))}
      </MapView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  map: {
    width: Dimensions.get('window').width, // Full width
    height: Dimensions.get('window').height, // Full height
  },
});



