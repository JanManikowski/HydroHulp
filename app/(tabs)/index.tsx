import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import Slider from '@react-native-community/slider';
import { BarCodeScanner } from 'expo-barcode-scanner';
import dayjs from 'dayjs';

interface ProductInfo {
  name: string;
  quantity: number;
  originalQuantity: number; // Added field for original quantity
  imageUrl: string;
  date: string;
}

const App: React.FC = () => {
  const [barcode, setBarcode] = useState<string>('');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [productList, setProductList] = useState<ProductInfo[]>([]);
  const [cupSize, setCupSize] = useState<number | null>(null);
  const [isCupInputVisible, setIsCupInputVisible] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isCameraVisible, setIsCameraVisible] = useState<boolean>(false);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualBarcode, setManualBarcode] = useState<string>('');

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

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Product Scanner</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setIsCameraVisible(true);
            setScanned(false);
          }}
        >
          <Text style={styles.buttonText}>Scan Barcode</Text>
        </TouchableOpacity>
        {isCameraVisible && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
        )}
        {showManualInput && (
          <View style={styles.manualInputContainer}>
            <Text style={styles.infoText}>Enter Barcode Manually:</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setManualBarcode(text)}
              value={manualBarcode}
              placeholder="Enter barcode"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleManualBarcodeSubmit}>
              <Text style={styles.buttonText}>Fetch Product</Text>
            </TouchableOpacity>
          </View>
        )}
        {productInfo && productInfo.name === 'Cup of Water' && productInfo.imageUrl ? (
          <Image source={require('./glass-of-water.jpg')} style={styles.productImage} />
        ) : null}
        {productInfo && productInfo.name !== 'Cup of Water' && (
          <View style={styles.result}>
            <Text style={styles.infoText}>Name: {productInfo.name}</Text>
            <Text style={styles.infoText}>Quantity: {productInfo.quantity}ml</Text>
            {productInfo.imageUrl ? (
              <Image source={{ uri: productInfo.imageUrl }} style={styles.productImage} />
            ) : null}
            {productInfo && productInfo.name !== 'Cup of Water' && (
              <View style={styles.sliderContainer}>
                <Text style={styles.infoText}>Adjust Quantity:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={productInfo.originalQuantity} // Use originalQuantity here
                  step={1}
                  value={sliderValue}
                  onValueChange={(value) => setSliderValue(value)}
                />
                <Text style={styles.infoText}>Selected Quantity: {sliderValue}ml</Text>
                <TouchableOpacity style={styles.button} onPress={() => addToTotal(sliderValue, productInfo.name, productInfo.imageUrl, productInfo.originalQuantity)}>
                  <Text style={styles.buttonText}>Add to Total</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {isCupInputVisible ? (
          <View style={styles.result}>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setCupSize(parseFloat(text))}
              value={cupSize ? cupSize.toString() : ''}
              placeholder="Enter cup size in ml"
              keyboardType="numeric"
              placeholderTextColor="#8dd6ed"
            />
            <TouchableOpacity style={styles.button} onPress={saveCupSize}>
              <Text style={styles.buttonText}>Save Cup</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.result}>
            <Text style={styles.infoText}>Cup Size: {cupSize} ml</Text>
            <TouchableOpacity style={styles.button} onPress={addCupToTotal}>
              <Text style={styles.buttonText}>Add 1 Cup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={editCupSize}>
              <Text style={styles.buttonText}>Edit Cup Size</Text>
            </TouchableOpacity>
          </View>
        )}
        <Progress.Bar progress={progress} width={400} color={progressBarColor} />
        <Text style={styles.totalText}>Total Quantity: {totalQuantity} ml / {goal} ml</Text>
        <TouchableOpacity style={styles.button} onPress={clearAll}>
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#8dd6ed',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#8dd6ed',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#8dd6ed',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  result: {
    marginTop: 20,
    padding: 10,
    borderColor: '#8dd6ed',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    width: '100%',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  sliderContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  infoText: {
    fontSize: 16,
    marginVertical: 5,
    color: '#000000',
  },
  totalText: {
    fontSize: 18,
    marginTop: 20,
    color: '#8dd6ed',
  },
  camera: {
    height: 300,
    width: '100%',
    marginVertical: 20,
  },
  manualInputContainer: {
    marginTop: 20,
    padding: 10,
    borderColor: '#8dd6ed',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    width: '100%',
    alignItems: 'center',
  },
});

export default App;