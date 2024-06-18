import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import { styled } from 'nativewind';

interface ProductInfo {
  name: string;
  quantity: number;
  imageUrl: string;
  date: string; // Ensure date is part of the interface
}

const ListScreen: React.FC = () => {
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const goal = 1500;

  const loadInitialData = async () => {
    const [total, list] = await Promise.all([
      AsyncStorage.getItem('totalQuantity'),
      AsyncStorage.getItem('productList')
    ]);
    if (total) setTotalQuantity(parseFloat(total));
    if (list) {
      const parsedList = JSON.parse(list);
      setProductList(parsedList);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const changeDate = (days: number) => {
    setCurrentDate(currentDate.add(days, 'day'));
  };

  // Filter products by current date
  const filteredProducts = productList.filter(product => dayjs(product.date).isSame(currentDate, 'day'));

  const progress = totalQuantity / goal;
  const progressBarColor = totalQuantity > goal ? 'red' : '#008080';

  return (
    <ScrollView className="flex-grow bg-white p-5">
      <View className="flex-row items-center mb-5">
        <View>
          <Text className="text-xl text-gray-800">Hallo</Text>
          <Text className="text-xl font-bold text-gray-800 ml-2">Hendrik de Vries</Text>
        </View>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          className="w-12 h-12 rounded-full ml-auto"
        />
      </View>

      <View className="flex-row items-center justify-center mb-2">
        <TouchableOpacity className="p-2" onPress={() => changeDate(-1)}>
          <Text className="text-lg text-gray-800">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800 mx-5">Vandaag</Text>
        <TouchableOpacity className="p-2" onPress={() => changeDate(1)}>
          <Text className="text-lg text-gray-800">{'>'}</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-center text-base text-gray-600 mb-5">{currentDate.format('DD-MM-YYYY')}</Text>

      <View className="flex-1">
        <Text className="text-lg text-gray-800 mb-2">Dagoverzicht</Text>
        {filteredProducts.map((product, index) => (
          <View key={index} className="flex-row items-center bg-secondary-20 p-5 rounded-lg mb-2">
            <Image source={product.name === 'Cup of Water' ? require('./glass-of-water.jpg') : { uri: product.imageUrl }} className="w-12 h-12 rounded-md mr-2" />
            <View className="flex-1 justify-between">
              <Text className="text-base text-gray-800">{product.name}</Text>
              <Text className="text-base text-gray-800">{product.quantity}ml</Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="bg-white rounded-md p-1 mx-1">
                <Text className="text-lg text-gray-800">✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-primary rounded-md p-2 mx-1">
                <Text className="text-lg text-white">-</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-primary rounded-md p-2 mx-1">
                <Text className="text-lg text-white">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View className="flex-row justify-between p-5 bg-secondary-20 rounded-lg mb-5">
          <Text className="text-lg text-gray-800">Totaal</Text>
          <Text className="text-lg text-gray-800">{totalQuantity} ml</Text>
        </View>

        <Text className="text-lg text-gray-800 mb-2">Voortgang</Text>
        <Text className="text-base text-gray-600 mb-2">Overzicht van de hoeveelheid vocht voor vandaag.</Text>
        <Progress.Bar progress={progress} width={null} color={progressBarColor} style={{ marginBottom: 20 }} />
        <Text className="text-lg text-gray-800 text-center">{totalQuantity} / {goal} ml</Text>
      </View>
    </ScrollView>
  );
};

export default ListScreen;
