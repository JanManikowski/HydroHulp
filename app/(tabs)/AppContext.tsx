import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  name: string;
  quantity: number;
}

interface ProductContextType {
  productList: Product[];
  loadProductList: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | null>(null);

export const ProductProvider: React.FC = ({ children }) => {
  const [productList, setProductList] = useState<Product[]>([]);

  useEffect(() => {
    loadProductList();
  }, []);

  const loadProductList = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('productList');
      if (jsonValue !== null) {
        setProductList(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Error loading product list:', error);
    }
  };

  return (
    <ProductContext.Provider value={{ productList, loadProductList }}>
      {children}
    </ProductContext.Provider>
  );
};
