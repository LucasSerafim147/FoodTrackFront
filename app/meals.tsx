import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { getMeals, isTokenValid, logout } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

interface Meal {
  _id: string;
  titulo?: string;
  descricao?: string;
  imagem?: string; // Campo para a URL da imagem
}

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMeals = async () => {
    try {
      const tokenValid = await isTokenValid();
      if (!tokenValid) {
        await logout();
        Alert.alert('Sessão expirada', 'Faça login novamente', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }
      const result = await getMeals();
      if (result.success) setMeals(result.meals || []);
      else Alert.alert('Erro', result.message);
    } catch (error) {
      console.error('Erro ao buscar refeições:', error);
      Alert.alert('Erro', 'Falha ao carregar refeições');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#1E90FF" style={styles.loading} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Refeições</Text>
      {meals.length === 0 ? (
        <Text style={styles.empty}>Nenhuma refeição</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardImageContainer}>
                {item.imagem ? (
                  <Image
                    source={{ uri: item.imagem }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>Sem Imagem</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.titulo || 'Sem título'}</Text>
              <Text style={styles.cardDesc}>{item.descricao || 'Sem descrição'}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  empty: { fontSize: 16, textAlign: 'center', color: '#666' },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    padding: 8,
    maxWidth: '47%', // Ajusta para 2 colunas com margem
  },
  cardImageContainer: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
  },
});