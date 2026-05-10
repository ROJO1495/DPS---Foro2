import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import AuthService from '../services/AuthService';
import { useFormValidation } from '../hooks/Validation';

const LoginWidget = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { errors, validate } = useFormValidation();

  const handleAuthAction = async () => {
    if (!validate(email, password, !isLoginMode, confirmPassword)) return;
    
    let result;
    if (isLoginMode) {
      result = await AuthService.signInWithEmail(email, password);
    } else {
      result = await AuthService.signUpWithEmail(email, password);
    }

    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      Alert.alert('Exito', isLoginMode ? 'Sesion iniciada' : 'Cuenta creada');
    }
  };

  return (
    <View style={styles.card}>
      {/* Selector de Modo (Tabs) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, isLoginMode && styles.activeTab]} 
          onPress={() => setIsLoginMode(true)}
        >
          <Text style={[styles.tabText, isLoginMode && styles.activeTabText]}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, !isLoginMode && styles.activeTab]} 
          onPress={() => setIsLoginMode(false)}
        >
          <Text style={[styles.tabText, !isLoginMode && styles.activeTabText]}>Registro</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{isLoginMode ? 'Bienvenido de nuevo' : 'Crear cuenta'}</Text>
      
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Correo electronico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        placeholder="Contrasena"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {!isLoginMode && (
        <>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Confirmar contrasena"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </>
      )}

      <TouchableOpacity style={styles.buttonPrimary} onPress={handleAuthAction}>
        <Text style={styles.buttonText}>{isLoginMode ? 'Entrar' : 'Registrarse'}</Text>
      </TouchableOpacity>

      {isLoginMode && (
        <TouchableOpacity style={styles.buttonGoogle} onPress={() => AuthService.signInWithGoogle()}>
          <Text style={styles.buttonTextGoogle}>Continuar con Google</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    margin: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    padding: 5,
    marginBottom: 25,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
  },
  tabText: {
    color: '#757575',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#6200EE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    fontSize: 15,
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonPrimary: {
    backgroundColor: '#6200EE',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonGoogle: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextGoogle: {
    color: '#424242',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginWidget;