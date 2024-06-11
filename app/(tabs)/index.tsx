import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hallo,</Text>
            <Text style={styles.userName}>Hendrik de Vries</Text>
          </View>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.userImage}
            />
        </View>
        <View style={styles.container}>
          <View style={styles.cardRow}>
            {/* <TouchableOpacity style={styles.cardButton}>
              <Image source={require('./icon.png')} style={styles.cardIcon} />
              <Text style={styles.cardButtonText}>Drink schema</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.cardButton}>
              <Image source={require('./icon.png')} style={styles.cardIcon} />
              <Text style={styles.cardButtonText}>Glas water</Text>
              <View style={styles.quantityControl}>
                <Text style={styles.quantityText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.lastAddedText}>Laatst toegevoegd</Text>
            {latestProduct && (
              <View style={styles.latestProduct}>
                <Image source={{ uri: latestProduct.imageUrl }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{latestProduct.name}</Text>
                  <Text style={styles.productQuantity}>{latestProduct.quantity}ml</Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View className="bg-primary">         
            <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, doloremque.</Text>
          </View>

          <TouchableOpacity style={styles.overviewButton}>
            <Text style={styles.overviewButtonText}>Bekijk uw dagoverzicht</Text>
          </TouchableOpacity>

          <Text style={styles.progressText}>Progressie</Text>
          <Text style={styles.progressSubText}>Overzicht van de hoeveelheid vocht voor vandaag.</Text>
          <Progress.Bar progress={progress} width={null} color={progressBarColor} style={styles.progressBar} />
          <Text style={styles.totalText}>{totalQuantity} / {goal} ML</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
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
  container: {
    flex: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardButton: {
    backgroundColor: '#eaf4fc',
    padding: 20,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  cardButtonText: {
    fontSize: 18,
    color: '#333',
    marginTop: 10,
  },
  cardIcon: {
    width: 50,
    height: 50,
  },
  productInfo: {
    backgroundColor: '#eaf4fc',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  lastAddedText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  latestProduct: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    color: '#333',
  },
  productQuantity: {
    fontSize: 18,
    color: '#333',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
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
  overviewButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewButtonText: {
    fontSize: 18,
    color: '#fff',
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
  },
  quantityText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
});

export default App;
