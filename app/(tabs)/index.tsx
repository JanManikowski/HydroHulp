import Slider from '@react-native-community/slider';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { BarCodeScanner } from 'expo-barcode-scanner';
import dayjs from 'dayjs';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { scheduleRepeatingNotification } from './notificationHelper';

interface ProductInfo {
  name: string;
  quantity: number;
  originalQuantity: number;
  imageUrl: string;
  date: string;
}

const App: React.FC = () => {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [latestProduct, setLatestProduct] = useState<ProductInfo | null>(null);
  const [cupSize, setCupSize] = useState<number | null>(null);
  const [isCupInputVisible, setIsCupInputVisible] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualBarcode, setManualBarcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [barcode, setBarcode] = useState<string>('');

  const goal = 1500;

  useEffect(() => {
    const loadInitialData = async () => {
      const [total, list] = await Promise.all([
        AsyncStorage.getItem('totalQuantity'),
        AsyncStorage.getItem('productList')
      ]);
      if (total) setTotalQuantity(parseFloat(total));
      if (list) {
        const parsedList = JSON.parse(list);
        setProductList(parsedList);
        setLatestProduct(parsedList[parsedList.length - 1] || null);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    (async () => {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      if (status !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        if (status !== 'granted') {
          Alert.alert('Failed to get push token for push notification!');
          return;
        }
      }
      // Schedule the repeating notification after getting permission
      await scheduleRepeatingNotification();
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    setIsCameraVisible(false);
    fetchProductDetails(data);
  };

  const fetchProductDetails = async (barcode: string) => {
    setIsLoading(true);
    setShowManualInput(false);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 0) return alert('Product not found.'), setProductInfo(null);

      const quantity = parseFloat(data.product.product_quantity || data.product.serving_quantity || '0') || 0;
      const imageUrl = data.product.image_url || '';
      setProductInfo({ name: data.product.product_name, quantity, originalQuantity: quantity, imageUrl, date: dayjs().format('YYYY-MM-DD') });
      setSliderValue(quantity);
    } catch (error) {
      alert('Failed to fetch product details. Please try again.');
      console.error('Error fetching product:', error);
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualBarcodeSubmit = () => {
    fetchProductDetails(manualBarcode);
  };

  const addToTotal = async (quantity: number, name: string, imageUrl: string, originalQuantity: number) => {
    const newTotal = totalQuantity + quantity;
    const newList = [...productList, { name, quantity, originalQuantity, imageUrl, date: dayjs().format('YYYY-MM-DD') }];
    setTotalQuantity(newTotal);
    setProductList(newList);
    setLatestProduct(newList[newList.length - 1]);
    await Promise.all([
      AsyncStorage.setItem('totalQuantity', newTotal.toString()),
      AsyncStorage.setItem('productList', JSON.stringify(newList))
    ]);
    setProductInfo({ name, quantity, originalQuantity, imageUrl, date: dayjs().format('YYYY-MM-DD') });
  };

  const addCupToTotal = () => {
    if (cupSize) {
      addToTotal(cupSize, 'Cup of Water', './glass-of-water.jpg', cupSize);
    }
  };

  const saveCupSize = async () => {
    if (cupSize) {
      setIsCupInputVisible(false);
      await AsyncStorage.setItem('cupSize', cupSize.toString());
    } else {
      alert('Please enter a valid cup size.');
    }
  };

  const editCupSize = () => {
    setIsCupInputVisible(true);
  };

  const clearAll = async () => {
    await AsyncStorage.multiRemove(['totalQuantity', 'productList', 'cupSize']);
    setTotalQuantity(0);
    setProductList([]);
    setCupSize(null);
    setIsCupInputVisible(true);
  };

  const progress = totalQuantity / goal;
  const progressBarColor = totalQuantity > goal ? 'red' : '#8dd6ed';

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="p-4">
        <View className="flex-row items-center mb-4">
          <View>
            <Text className="text-3xl text-gray-700">Hallo,</Text>
            <Text className="text-3xl font-bold text-gray-700">Hendrik de Vries</Text>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            className="w-12 h-12 rounded-full ml-auto"
          />
        </View>
        <View className="flex-1">
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity className="bg-blue-200 p-5 rounded-lg flex-1 mx-2">
              <Image source={require('./icon.png')} className="w-12 h-12" />
              <Text className="text-lg text-gray-700 mt-2">Glas water</Text>
              <View className="flex-row items-center">
                <Text className="text-lg text-gray-700">1</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-blue-200 p-5 rounded-lg mb-4">
            <Text className="text-lg text-gray-700 mb-2">Laatst toegevoegd</Text>
            {latestProduct && (
              <View className="flex-row items-center">
                <Image source={{ uri: latestProduct.imageUrl }} className="w-12 h-12 rounded mr-2" />
                <View className="flex-1 flex-row justify-between items-center">
                  <Text className="text-lg text-gray-700">{latestProduct.name}</Text>
                  <Text className="text-lg text-gray-700">{latestProduct.quantity}ml</Text>
                  <View className="flex-row items-center">
                    <TouchableOpacity className="bg-blue-500 rounded p-2 mr-2">
                      <Text className="text-lg text-white">-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-blue-500 rounded p-2">
                      <Text className="text-lg text-white">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          {isCupInputVisible && (
            <View className="bg-blue-200 p-5 rounded-lg mb-4">
              <TextInput
                className="bg-white p-2 rounded-lg text-gray-700"
                onChangeText={(text) => setCupSize(parseFloat(text))}
                value={cupSize ? cupSize.toString() : ''}
                placeholder="Enter cup size in ml"
                keyboardType="numeric"
              />
              <TouchableOpacity className="bg-blue-600 p-2 rounded-lg mt-2" onPress={saveCupSize}>
                <Text className="text-lg text-white">Save Cup</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="bg-primary mb-4">         
            <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, doloremque.</Text>
          </View>

          <TouchableOpacity className="bg-blue-600 p-5 rounded-lg mb-4">
            <Text className="text-lg text-white">Bekijk uw dagoverzicht</Text>
          </TouchableOpacity>

          <Text className="text-lg text-gray-700 mb-5">Voortgang</Text>
          <Text className="text-sm text-gray-600 mb-2">De hoeveelheid milliliter vochtinname van vandaag.</Text>
          <Progress.Bar progress={progress} width={null} color={progressBarColor} />
          <Text className="text-lg text-gray-700 text-center mt-5">{totalQuantity} / {goal} ML</Text>
        </View>

        {showManualInput && (
          <View className="bg-blue-200 p-5 rounded-lg mb-4">
            <Text className="text-lg text-gray-700 mb-2">Enter Barcode Manually:</Text>
            <TextInput
              className="bg-white p-2 rounded-lg text-gray-700"
              onChangeText={(text) => setManualBarcode(text)}
              value={manualBarcode}
              placeholder="Enter barcode"
              keyboardType="numeric"
            />
            <TouchableOpacity className="bg-blue-600 p-2 rounded-lg mt-2" onPress={handleManualBarcodeSubmit}>
              <Text className="text-lg text-white">Fetch Product</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCameraVisible && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={{ height: 300, width: '100%', marginVertical: 20 }}
          />
        )}

        {productInfo && (
          <View className="bg-blue-200 p-5 rounded-lg mb-4">
            <Text className="text-lg text-gray-700 mb-2">Name: {productInfo.name}</Text>
            <Text className="text-lg text-gray-700 mb-2">Quantity: {productInfo.quantity}ml</Text>
            {productInfo.imageUrl && (
              <Image source={{ uri: productInfo.imageUrl }} className="w-24 h-24 rounded mb-2" />
            )}
            <View className="mt-2">
              <Text className="text-lg text-gray-700 mb-2">Adjust Quantity:</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={productInfo.originalQuantity} // Use originalQuantity here
                step={1}
                value={sliderValue}
                onValueChange={(value) => setSliderValue(value)}
              />
              <Text className="text-lg text-gray-700 text-center mt-2">Selected Quantity: {sliderValue}ml</Text>
              <TouchableOpacity className="bg-blue-600 p-2 rounded-lg mt-2" onPress={() => addToTotal(sliderValue, productInfo.name, productInfo.imageUrl, productInfo.originalQuantity)}>
                <Text className="text-lg text-white">Add to Total</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
