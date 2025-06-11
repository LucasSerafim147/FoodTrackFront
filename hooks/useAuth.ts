import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (email: string, senha: string) => {
  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
  } catch (error) {}
};
