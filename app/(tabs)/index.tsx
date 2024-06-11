import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';

interface ProductInfo {
  name: string;
  quantity: number;
  imageUrl: string;
}

const App: React.FC = () => {
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [latestProduct, setLatestProduct] = useState<ProductInfo | null>(null);
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

  const addToTotal = async (quantity: number, name: string) => {
    const newTotal = totalQuantity + quantity;
    const newList = [...productList, { name, quantity, imageUrl: productInfo?.imageUrl || '' }];
    setTotalQuantity(newTotal);
    setProductList(newList);
    setLatestProduct(newList[newList.length - 1]);
    await Promise.all([
      AsyncStorage.setItem('totalQuantity', newTotal.toString()),
      AsyncStorage.setItem('productList', JSON.stringify(newList))
    ]);
  };

  const progress = totalQuantity / goal;
  const progressBarColor = totalQuantity > goal ? 'red' : '#8dd6ed';

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

          <View className="bg-primary mb-4">         
            <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, doloremque.</Text>
          </View>

          <TouchableOpacity className="bg-blue-600 p-5 rounded-lg mb-4">
            <Text className="text-lg text-white">Bekijk uw dagoverzicht</Text>
          </TouchableOpacity>

          <Text className="text-lg text-gray-700 mb-5">Progressie</Text>
          <Text className="text-sm text-gray-600 mb-2">Overzicht van de hoeveelheid vocht voor vandaag.</Text>
          <Progress.Bar progress={progress} width={null} color={progressBarColor} />
          <Text className="text-lg text-gray-700 text-center mt-5">{totalQuantity} / {goal} ML</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
