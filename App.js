import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Importamos la conexión de auth y tus componentes
import { auth } from './src/services/AuthService';
import LoginWidget from './src/components/LoginWidget';
import AgregarGasto from './src/components/AgregarGasto';

const App = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Este "escuchador" detecta automáticamente cuando te logueas en el LoginWidget
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return unsubscribe;
  }, []);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Si hay usuario, mostramos tu pantalla de gastos. Si no, mostramos el login */}
      {usuario ? (
        <View style={styles.appContent}>
          {/* Barra superior con opción para cerrar sesión y probar de nuevo */}
          <View style={styles.header}>
            <Text style={styles.headerText}>{usuario.email}</Text>
            <TouchableOpacity onPress={cerrarSesion}>
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>
          
          {/* TU COMPONENTE */}
          <AgregarGasto />
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <LoginWidget />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', // El color de fondo que ya tenían
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  appContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 40, // Margen extra por si la cámara tapa el texto en el celular
    backgroundColor: '#6200EE',
  },
  headerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#ffcccc',
    fontWeight: 'bold',
  }
});

export default App;