import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, senha: string) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if(!response.ok){
      await AsyncStorage.setItem("token", data.token);
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: "Erro de rede" };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem("token");
};
