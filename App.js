import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Importamos la conexión de auth y tus componentes
import { auth } from './src/services/AuthService';
import LoginWidget from './src/components/LoginWidget';
import AgregarGasto from './src/components/AgregarGasto';
import HistorialGastos from './src/components/HistorialGastos';
import ResumenMensual from './src/components/ResumenMensual';

const App = () => {
  const [usuario, setUsuario] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState('registro');

  useEffect(() => {
    // Este "escuchador" detecta automáticamente cuando te logueas en el LoginWidget
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      if (!user) {
        setPestanaActiva('registro');
      }
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

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentWrapper}>
              {usuario ? <ResumenMensual userId={usuario.uid} /> : null}

              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    pestanaActiva === 'registro' ? styles.tabButtonActiva : null,
                  ]}
                  onPress={() => setPestanaActiva('registro')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      pestanaActiva === 'registro' ? styles.tabButtonTextActiva : null,
                    ]}
                  >
                    Registrar gasto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    pestanaActiva === 'historial' ? styles.tabButtonActiva : null,
                  ]}
                  onPress={() => setPestanaActiva('historial')}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      pestanaActiva === 'historial' ? styles.tabButtonTextActiva : null,
                    ]}
                  >
                    Historial
                  </Text>
                </TouchableOpacity>
              </View>

              {pestanaActiva === 'registro' ? <AgregarGasto /> : null}
              {pestanaActiva === 'historial' ? (
                <HistorialGastos userId={usuario.uid} />
              ) : null}
            </View>
          </ScrollView>
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F0F2F5',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  tabButtonActiva: {
    backgroundColor: '#6200EE',
  },
  tabButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  tabButtonTextActiva: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 680,
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