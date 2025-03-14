import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapStore } from '@/stores/mapStore';
import { useAuth } from '@/hooks/authContext';

export default function MapScreen() {
  const { region, setRegion } = useMapStore();
  const { user } = useAuth();
  const [isAddingPoints, setIsAddingPoints] = useState(false);
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [setRegion]);

  const handleAddPointsToggle = () => {
    console.log('Add points toggled to:', !isAddingPoints);
    setIsAddingPoints(!isAddingPoints);
  };

  const handleMapPress = (e) => {
    if (!isAddingPoints) return;
    const newPoint = e.nativeEvent.coordinate;
    console.log('New point added:', newPoint);
    setPoints([...points, newPoint]);
  };

  const handleMarkerDrag = (index, e) => {
    const updatedPoints = [...points];
    updatedPoints[index] = e.nativeEvent.coordinate;
    setPoints(updatedPoints);
    console.log('Point moved:', updatedPoints[index]);
  };

  const handleRemoveLastPoint = () => {
    if (points.length === 0) return;
    const updatedPoints = points.slice(0, -1);
    setPoints(updatedPoints);
    console.log('Last point removed. Remaining points:', updatedPoints);
  };

  const handleSavePoints = async () => {
    if (points.length === 0) return;

    if (!user || !user.userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
  const payload = {
    user_id: parseInt(user.userId, 10),
    content: 'Sample route',
    points: points,
    status: 'active',
  };
  console.log('Sending data to backend:', payload);

  try {
    const response = await fetch('http://localhost:8080/courses/save-points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text(); // 실패 시 텍스트로 에러 메시지 읽기
      throw new Error(`Failed to save points: ${response.status} - ${errorText}`);
    }

    const result = await response.json(); // 성공 시 JSON 파싱
    console.log('Points saved to backend:', result);
    alert('포인트가 백엔드에 저장되었습니다!');
    setPoints([]);
  } catch (error) {
    console.error('Error saving points:', error.message);
    alert(`백엔드 저장에 실패했습니다: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        region={region || undefined}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={handleMapPress}
      >
        {points.map((point, index) => (
          <Marker
            key={index}
            coordinate={point}
            draggable
            onDragEnd={(e) => handleMarkerDrag(index, e)}
          />
        ))}
        {points.length > 1 && (
          <Polyline coordinates={points} strokeColor="#FF0000" strokeWidth={2} />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <Button
          title={isAddingPoints ? '중지' : '추가'}
          onPress={handleAddPointsToggle}
          color={isAddingPoints ? 'red' : 'blue'}
        />
        <Button
          title="삭제"
          onPress={handleRemoveLastPoint}
          color="gray"
          disabled={points.length === 0}
        />
        <Button
          title="저장"
          onPress={handleSavePoints}
          color="green"
          disabled={points.length === 0 || isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    left: '50%', // '100%'에서 수정
    transform: [{ translateX: -180 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 10,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});