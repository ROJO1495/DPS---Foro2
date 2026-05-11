import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';

// Importamos db y auth desde el servicio que arreglamos
import { db, auth } from '../services/AuthService'; 

const AgregarGasto = () => {
  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');

  const registrarGasto = async () => {
    // 1. Validaciones básicas de campos vacíos
    if (!nombre || !monto || !categoria) {
      alert('Campos incompletos: Por favor llena todos los datos del gasto.');
      return;
    }

    // 2. Verificar que haya un usuario logueado
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
      console.log("Error: No se detectó un usuario autenticado.");
      alert('Error: Debes iniciar sesión para registrar un gasto.');
      return;
    }

    try {
      console.log("1. Intentando enviar datos a Firestore...");
      console.log("Datos a enviar:", {
        nombre: nombre,
        monto: parseFloat(monto),
        categoria: categoria,
        userId: usuarioActual.uid
      });

      // 3. Ejecutar la escritura en la base de datos
      await addDoc(collection(db, 'gastos'), {
        nombre: nombre,
        monto: parseFloat(monto), 
        categoria: categoria,
        fecha: new Date(), 
        userId: usuarioActual.uid // El ID del usuario de la Persona 2
      });

      console.log("2. ¡Firebase confirmó el guardado con éxito!");
      alert('¡Éxito! El gasto se ha guardado correctamente.');
      
      // Limpiar formulario después de guardar
      setNombre('');
      setMonto('');
      setCategoria('');

    } catch (error) {
      // Si llegamos aquí, Firestore rechazó la operación (ej. por las Reglas de seguridad)
      console.error("3. Error detectado por Firebase: ", error);
      alert('Error de Firebase: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>Registrar Gasto</Text>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="¿En qué gastaste?"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Monto ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={monto}
          onChangeText={setMonto}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Comida, Transporte, Ocio"
          value={categoria}
          onChangeText={setCategoria}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.boton} onPress={registrarGasto}>
          <Text style={styles.textoBoton}>Guardar Gasto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333'
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '600'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA'
  },
  boton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});

export default AgregarGasto;