import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { getToken } from '@/hooks/useAuth';

const mealSchema = yup.object().shape({
  titulo: yup.string().required('Título obrigatório'),
  descricao: yup.string().required('Descrição obrigatória'),
});

export default function NovaMealsScreen() {
  const router = useRouter();

  const enviarRefeicao = async (values: { titulo: string; descricao: string }) => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Erro', 'Você precisa estar logado para adicionar refeições');
      return;
    }

    console.log('Valores enviados:', values); // Log para verificar os valores
    try {
      const response = await fetch('http://localhost:3000/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ titulo: values.titulo, descricao: values.descricao }),
      });

      const responseData = await response.json();
      console.log('Resposta do servidor (POST /meals):', { status: response.status, data: responseData });

      if (response.ok) {
        Alert.alert('Sucesso', 'Refeição adicionada!');
        router.replace('/meals');
      } else {
        Alert.alert('Erro', responseData.message || 'Não foi possível adicionar');
      }
    } catch (err) {
      console.error('Erro na requisição (POST /meals):', err);
      Alert.alert('Erro', 'Erro na requisição');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Refeição</Text>

      <Formik
        validationSchema={mealSchema}
        initialValues={{ titulo: '', descricao: '' }}
        onSubmit={enviarRefeicao}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Título da Refeição"
              onChangeText={handleChange('titulo')}
              onBlur={handleBlur('titulo')}
              value={values.titulo}
            />
            {touched.titulo && errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              onChangeText={handleChange('descricao')}
              onBlur={handleBlur('descricao')}
              value={values.descricao}
            />
            {touched.descricao && errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}

            <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={!isValid}>
              <Text style={styles.buttonText}>Salvar Refeição</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: 'black' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  errorText: { color: 'red', marginBottom: 10 },
});