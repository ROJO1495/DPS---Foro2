import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../services/AuthService';

const normalizarFecha = (valor) => {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate();
  if (valor instanceof Date) return valor;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const esDelMesActual = (fecha) => {
  if (!fecha) return false;
  const hoy = new Date();
  return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
};

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const ResumenMensual = ({ userId }) => {
  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    if (!userId) {
      setGastos([]);
      return undefined;
    }

    const gastosQuery = query(
      collection(db, 'gastos'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(gastosQuery, (snapshot) => {
      setGastos(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return { monto: Number(data.monto) || 0, fecha: normalizarFecha(data.fecha) };
        })
      );
    });

    return unsubscribe;
  }, [userId]);

  const totalMensual = useMemo(
    () => gastos.reduce((acc, g) => (esDelMesActual(g.fecha) ? acc + g.monto : acc), 0),
    [gastos]
  );

  const hoy = new Date();
  const etiqueta = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Total del mes actual</Text>
      <Text style={styles.subtitulo}>{etiqueta}</Text>
      <Text style={styles.monto}>${totalMensual.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#123C69',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  titulo: {
    color: '#D9E6F2',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitulo: {
    color: '#8BAEC8',
    fontSize: 12,
    marginBottom: 6,
  },
  monto: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
  },
});

export default ResumenMensual;
