import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';

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
  const progressBarColor = totalQuantity > goal ? 'red' : '#8dd6ed';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hallo</Text>
          <Text style={styles.userName}>Hendrik de Vries</Text>
        </View>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.userImage}
        />
      </View>

      <View style={styles.dateContainer}>
        <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(-1)}>
          <Text style={styles.dateButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>Vandaag</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => changeDate(1)}>
          <Text style={styles.dateButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.dateSubText}>{currentDate.format('DD-MM-YYYY')}</Text>

      <View style={styles.container}>
        <Text style={styles.overviewText}>Dagoverzicht</Text>
        {filteredProducts.map((product, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={product.name === 'Cup of Water' ? require('./glass-of-water.jpg') : { uri: product.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productQuantity}>{product.quantity}ml</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Totaal</Text>
          <Text style={styles.totalAmountText}>{totalQuantity} ml</Text>
        </View>

        <Text style={styles.progressText}>Voortgang</Text>
        <Text style={styles.progressSubText}>Overzicht van de hoeveelheid vocht voor vandaag.</Text>
        <Progress.Bar progress={progress} width={null} color={progressBarColor} style={styles.progressBar} />
        <Text style={styles.totalText}>{totalQuantity} / {goal} ml</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#333',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 'auto',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#333',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  dateSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  container: {
    flex: 1,
  },
  overviewText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaf4fc',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    color: '#333',
  },
  productQuantity: {
    fontSize: 16,
    color: '#333',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  editButtonText: {
    fontSize: 18,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#8dd6ed',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  addButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#eaf4fc',
    borderRadius: 10,
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    color: '#333',
  },
  totalAmountText: {
    fontSize: 18,
    color: '#333',
  },
  progressText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  progressSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  progressBar: {
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  }
});

export default ListScreen;
