// src/app/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'expo-router';
import { register } from '@/hooks/useAuth';

const registerValidationSchema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').trim(),
  email: yup.string().email('Email inválido').required('Email é obrigatório').trim(),
  senha: yup.string().min(6, 'Mínimo 6 caracteres').required('Senha é obrigatória').trim(),
});

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: { nome: string; email: string; senha: string }) => {
    setLoading(true);
    const result = await register(values.nome, values.email, values.senha);
    setLoading(false);

    console.log('Resultado do register:', result); 

    if (result?.success) {
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      router.replace('/login');
    } else {
      Alert.alert('Erro', result?.message || 'Erro ao registrar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <Formik
        validationSchema={registerValidationSchema}
        initialValues={{ nome: '', email: '', senha: '' }}
        onSubmit={handleRegister}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
        }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              onChangeText={handleChange('nome')}
              onBlur={handleBlur('nome')}
              value={values.nome}
            />
            {errors.nome && touched.nome && (
              <Text style={styles.errorText}>{errors.nome}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              onChangeText={handleChange('senha')}
              onBlur={handleBlur('senha')}
              value={values.senha}
            />
            {errors.senha && touched.senha && (
              <Text style={styles.errorText}>{errors.senha}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, { opacity: isValid && !loading ? 1 : 0.5 }]}
              onPress={() => handleSubmit()}
              disabled={!isValid || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Carregando...' : 'Registrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.signIn}>
                Já tem uma conta? <Text style={styles.signInLink}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  signIn: {
    color: '#000',
  },
  signInLink: {
    color: '#1E90FF',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});
