import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import Slider from '@react-native-community/slider';
// import 'nativewind';

interface ProductInfo {
  name: string;
  quantity: number;
  imageUrl: string;
}

const App: React.FC = () => {
  const [barcode, setBarcode] = useState<string>('');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [cupSize, setCupSize] = useState<number | null>(null);
  const [isCupInputVisible, setIsCupInputVisible] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(100); 
  const goal = 1500;

  useEffect(() => {
    const loadInitialData = async () => {
      const [total, list, storedCupSize] = await Promise.all([
        AsyncStorage.getItem('totalQuantity'),
        AsyncStorage.getItem('productList'),
        AsyncStorage.getItem('cupSize')
      ]);
      if (total) setTotalQuantity(parseFloat(total));
      if (list) setProductList(JSON.parse(list));
      if (storedCupSize) {
        setCupSize(parseFloat(storedCupSize));
        setIsCupInputVisible(false);
      }
    };
    loadInitialData();
  }, []);

  const fetchProductDetails = async () => {
    if (!barcode.trim()) return alert('Vul een barcode in.');
    setIsLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);
      const data = await response.json();
      if (data.status === 0) return alert('Artikel niet gevonden.'), setProductInfo(null);

      const quantity = parseFloat(data.product.product_quantity || data.product.serving_quantity || '0') || 0;
      const imageUrl = data.product.image_url || '';
      setProductInfo({ name: data.product.product_name, quantity, imageUrl });
    } catch (error) {
      alert('Het is niet gelukt om de artikel informatie op te halen. Probeer het opnieuw.');
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToTotal = async (quantity: number, name: string, imageUrl: string) => {
    const newTotal = totalQuantity + quantity;
    const newList = [...productList, { name, quantity, imageUrl }];
    setTotalQuantity(newTotal);
    setProductList(newList);
    await Promise.all([
      AsyncStorage.setItem('totalQuantity', newTotal.toString()),
      AsyncStorage.setItem('productList', JSON.stringify(newList))
    ]);
    setProductInfo({ name, quantity, imageUrl });
  };

  const addCupToTotal = () => {
    if (cupSize) {
      addToTotal(cupSize, 'Cup of Water', './glass-of-water.jpg');
    }
  };

  const saveCupSize = async () => {
    if (cupSize) {
      setIsCupInputVisible(false);
      await AsyncStorage.setItem('cupSize', cupSize.toString());
    } else {
      alert('Voeg een valide glasgrootte in');
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

  return (
    <ScrollView contentContainerStyle="flex-grow justify-center items-center p-5 bg-white">
      <View className="flex-1 w-full justify-center items-center mt-10">
        <Text className="text-2xl font-bold mb-5 text-primary">Scan hier de barcode</Text>
        <TextInput
          className="w-full h-10 border border-primary mb-5 p-2 text-black bg-white"
          onChangeText={setBarcode}
          value={barcode}
          placeholder="Enter barcode"
          keyboardType="numeric"
          placeholderTextColor="#8dd6ed"
        />
        <TouchableOpacity
          className="bg-primary py-2 px-5 rounded-full my-2"
          onPress={fetchProductDetails}
          disabled={isLoading}
        >
          <Text className="text-white text-lg font-bold">{isLoading ? 'Loading...' : 'Haal Artikel Op'}</Text>
        </TouchableOpacity>
        {productInfo && productInfo.name === 'Cup of Water' && productInfo.imageUrl ? (
          <Image source={require('./glass-of-water.jpg')} className="w-24 h-24 my-2" />
        ) : null}
        {productInfo && productInfo.name !== 'Cup of Water' && (
          <View className="mt-5 p-2 border border-primary rounded bg-white w-full items-center">
            <Text className="text-lg text-black mb-2">Name: {productInfo.name}</Text>
            <Text className="text-lg text-black mb-2">Quantity: {productInfo.quantity}</Text>
            {productInfo.imageUrl ? (
              <Image source={{ uri: productInfo.imageUrl }} className="w-24 h-24 my-2" />
            ) : null}
            <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={() => addToTotal(productInfo.quantity, productInfo.name, productInfo.imageUrl)}>
              <Text className="text-white text-lg font-bold">Add to Total</Text>
            </TouchableOpacity>
          </View>
        )}
        {productInfo && productInfo.name !== 'Cup of Water' && (
          <View className="mt-5 w-full items-center">
            <Text className="text-lg text-black mb-2">Adjust Quantity:</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={sliderValue}
              onValueChange={(value) => setSliderValue(value)}
            />
            <Text className="text-lg text-black mb-2">Selected Quantity: {sliderValue}%</Text>
            <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={() => addToTotal((sliderValue / 100) * productInfo.quantity, productInfo.name, productInfo.imageUrl)}>
              <Text className="text-white text-lg font-bold">Add Selected Quantity to Total</Text>
            </TouchableOpacity>
          </View>
        )}
        {isCupInputVisible ? (
          <View className="mt-5 p-2 border border-primary rounded bg-white w-full items-center">
            <TextInput
              className="w-full h-10 border border-primary mb-5 p-2 text-black bg-white"
              onChangeText={(text) => setCupSize(parseFloat(text))}
              value={cupSize ? cupSize.toString() : ''}
              placeholder="Vul in glasgrootte in ml"
              keyboardType="numeric"
              placeholderTextColor="#8dd6ed"
            />
            <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={saveCupSize}>
              <Text className="text-white text-lg font-bold">Save Cup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="mt-5 p-2 border border-primary rounded bg-white w-full items-center">
            <Text className="text-lg text-black mb-2">Glas Grote: {cupSize} ml</Text>
            <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={addCupToTotal}>
              <Text className="text-white text-lg font-bold">Voeg 1 Glas Toe</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={editCupSize}>
              <Text className="text-white text-lg font-bold">Glas grootte aanpassen</Text>
            </TouchableOpacity>
          </View>
        )}
        <Progress.Bar progress={progress} width={400} color={progressBarColor} />
        <Text className="text-xl mt-5 text-primary">Totaal: {totalQuantity} ml / {goal} ml</Text>
        <TouchableOpacity className="bg-primary py-2 px-5 rounded-full my-2" onPress={clearAll}>
          <Text className="text-white text-lg font-bold">Alles verwijderen</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default App;
