import AsyncStorage from '@react-native-async-storage/async-storage';

   export const saveItem = async (key: string, value: string) => {
     await AsyncStorage.setItem(key, value);
   };

   export const getItem = async (key: string) => {
     return await AsyncStorage.getItem(key);
   };

   export const deleteItem = async (key: string) => {
     await AsyncStorage.removeItem(key);
   };