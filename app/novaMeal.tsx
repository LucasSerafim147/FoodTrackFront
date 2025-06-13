import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import * as yup from 'yup';
import { Formik } from 'formik';
import { useRouter } from 'expo-router';
import { getToken } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

// Desativar verificação estrita de tipos temporariamente (remover após ajustes)
const disableStrictTypeCheck = true;

const mealSchema = yup.object().shape({
  titulo: yup.string().required('Título obrigatório'),
  descricao: yup.string().required('Descrição obrigatória'),
  imagem: yup.mixed().nullable(), // Imagem é opcional
});

export default function NovaMealsScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async (useCamera: boolean, setFieldValue: (field: string, value: any) => void) => {
    try {
      let permissionResult;
      if (useCamera) {
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera');
          return;
        }
      } else {
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.status !== 'granted') {
          Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria');
          return;
        }
      }

      const result = await (useCamera
        ? ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          }));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const validTypes = ['image/jpeg', 'image/png'];
        if (asset.mimeType && !validTypes.includes(asset.mimeType)) {
          Alert.alert('Erro', 'Por favor, selecione uma imagem JPEG ou PNG');
          return;
        }
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Erro', 'A imagem deve ter menos de 5MB');
          return;
        }
        setImage(asset.uri);
        setFieldValue('imagem', asset);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const enviarRefeicao = async (values: { titulo: string; descricao: string; imagem?: any }, { resetForm }: any) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para adicionar refeições');
        return;
      }

      const formData = new FormData();
      formData.append('titulo', values.titulo);
      formData.append('descricao', values.descricao);

      if (values.imagem) {
        const asset = values.imagem;
        if (asset.uri) {
          const fileName = asset.uri.split('/').pop() || 'refeicao.jpg';
          const fileType = asset.mimeType || 'image/jpeg';
          formData.append('image', {
            uri: asset.uri,
            name: fileName,
            type: fileType,
          } as any);
          console.log('Enviando FormData com imagem - Detalhes:', {
            uri: asset.uri,
            name: fileName,
            type: fileType,
          });
        } else {
          console.log('Nenhum URI válido encontrado para a imagem');
        }
      } else {
        console.log('Enviando FormData sem imagem:', {
          titulo: values.titulo,
          descricao: values.descricao,
        });
      }

      // Converter FormData para tipo compatível
      const formDataAny = formData as any;
      console.log('FormData completo antes do envio:', Object.fromEntries(formDataAny));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        Alert.alert('Erro', 'Tempo de conexão esgotado. Verifique sua rede ou o servidor.');
      }, 10000);

      const response = await fetch('http://localhost:3000/api/meals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataAny,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();
      console.log('Resposta do servidor:', responseData);

      if (response.ok) {
        Alert.alert('Sucesso', 'Refeição adicionada com imagem!');
        setImage(null);
        resetForm();
        router.replace('/meals');
      } else {
        Alert.alert('Erro', responseData.message || 'Não foi possível adicionar');
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      // Alert.alert('Erro', .errname === 'AbortError' ? 'Tempo de conexão esgotado. Verifique sua rede ou o servidor.' : 'Erro na requisição ao servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Refeição</Text>

      <Formik
        validationSchema={mealSchema}
        initialValues={{ titulo: '', descricao: '', imagem: null }}
        onSubmit={enviarRefeicao}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, setFieldValue }) => (
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
              style={[styles.input, styles.textArea]}
              placeholder="Descrição"
              onChangeText={handleChange('descricao')}
              onBlur={handleBlur('descricao')}
              value={values.descricao}
              multiline
              numberOfLines={4}
            />
            {touched.descricao && errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}

            <View style={styles.imageContainer}>
              <Text style={styles.imageTitle}>Adicionar Foto:</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => pickImage(false, setFieldValue)}
                >
                  <FontAwesome name="photo" size={20} color="white" />
                  <Text style={styles.buttonText}> Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={() => pickImage(true, setFieldValue)}
                >
                  <FontAwesome name="camera" size={20} color="white" />
                  <Text style={styles.buttonText}> Câmera</Text>
                </TouchableOpacity>
              </View>

              {image && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setImage(null);
                      setFieldValue('imagem', null);
                    }}
                  >
                    <FontAwesome name="trash" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, (!isValid || isLoading) && styles.disabledButton]}
              onPress={() => handleSubmit()}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Enviando...' : 'Salvar Refeição'}</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: { color: '#fff', fontSize: 16 },
  errorText: { color: 'red', marginBottom: 10 },
  imageContainer: {
    marginVertical: 15,
  },
  imageTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    gap: 8,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4444',
    borderRadius: 20,
    padding: 8,
  },
});