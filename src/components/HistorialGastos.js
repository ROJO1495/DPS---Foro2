import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '../services/AuthService';
import CalendarDateField from './CalendarDateField';

const normalizarFecha = (valor) => {
  if (!valor) {
    return null;
  }

  if (typeof valor.toDate === 'function') {
    return valor.toDate();
  }

  if (valor instanceof Date) {
    return valor;
  }

  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

const esDelMesActual = (fecha) => {
  if (!fecha) {
    return false;
  }

  const hoy = new Date();
  return (
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  );
};

const normalizarInicioDelDia = (fecha) => {
  if (!fecha) {
    return null;
  }

  const resultado = new Date(fecha);
  resultado.setHours(0, 0, 0, 0);
  return resultado;
};

const normalizarFinDelDia = (fecha) => {
  if (!fecha) {
    return null;
  }

  const resultado = new Date(fecha);
  resultado.setHours(23, 59, 59, 999);
  return resultado;
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'Fecha no disponible';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const HistorialGastos = ({ userId }) => {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);

  useEffect(() => {
    if (!userId) {
      setGastos([]);
      setCargando(false);
      return undefined;
    }

    setCargando(true);
    setError('');

    const gastosQuery = query(
      collection(db, 'gastos'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      gastosQuery,
      (snapshot) => {
        const gastosUsuario = snapshot.docs
          .map((documento) => {
            const data = documento.data();
            const fecha = normalizarFecha(data.fecha);

            return {
              id: documento.id,
              ...data,
              fecha,
              monto: Number(data.monto) || 0,
            };
          })
          .sort((a, b) => {
            const fechaA = a.fecha ? a.fecha.getTime() : 0;
            const fechaB = b.fecha ? b.fecha.getTime() : 0;
            return fechaB - fechaA;
          });

        setGastos(gastosUsuario);
        setCargando(false);
      },
      (snapshotError) => {
        console.error('Error al leer gastos:', snapshotError);
        setError('No se pudo cargar el historial de gastos.');
        setCargando(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const categoriasDisponibles = useMemo(() => {
    const categorias = Array.from(
      new Set(
        gastos
          .map((gasto) => (gasto.categoria || '').trim())
          .filter((categoria) => categoria.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b, 'es'));

    return ['Todas', ...categorias];
  }, [gastos]);

  const fechaInicioParseada = useMemo(() => normalizarInicioDelDia(fechaInicio), [fechaInicio]);
  const fechaFinParseada = useMemo(() => normalizarFinDelDia(fechaFin), [fechaFin]);

  const rangoInvalido =
    fechaInicioParseada && fechaFinParseada && fechaInicioParseada > fechaFinParseada;

  const gastosFiltrados = useMemo(() => {
    return gastos.filter((gasto) => {
      const coincideCategoria =
        categoriaSeleccionada === 'Todas' || gasto.categoria === categoriaSeleccionada;

      const coincideFechaInicio =
        !fechaInicioParseada || (gasto.fecha && gasto.fecha >= fechaInicioParseada);

      const coincideFechaFin =
        !fechaFinParseada || (gasto.fecha && gasto.fecha <= fechaFinParseada);

      return coincideCategoria && coincideFechaInicio && coincideFechaFin;
    });
  }, [categoriaSeleccionada, fechaFinParseada, fechaInicioParseada, gastos]);

  const totalFiltrado = useMemo(
    () => gastosFiltrados.reduce((acc, gasto) => acc + gasto.monto, 0),
    [gastosFiltrados]
  );

  const limpiarFiltros = () => {
    setCategoriaSeleccionada('Todas');
    setFechaInicio(null);
    setFechaFin(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.historialCard}>
        <View style={styles.tituloContainer}>
          <Text style={styles.titulo}>Historial de gastos</Text>
        </View>

        <View style={styles.filtrosContainer}>
          <Text style={styles.filtrosTitulo}>Filtrar historial</Text>

          <Text style={styles.filtroLabel}>Categoria</Text>
          <View style={styles.categoriasWrap}>
            {categoriasDisponibles.map((categoria) => (
              <TouchableOpacity
                key={categoria}
                style={[
                  styles.categoriaChip,
                  categoriaSeleccionada === categoria ? styles.categoriaChipActiva : null,
                ]}
                onPress={() => setCategoriaSeleccionada(categoria)}
              >
                <Text
                  style={[
                    styles.categoriaChipTexto,
                    categoriaSeleccionada === categoria
                      ? styles.categoriaChipTextoActivo
                      : null,
                  ]}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filtroLabel}>Rango de fechas</Text>
          <View style={styles.fechasRow}>
            <CalendarDateField
              label="Fecha inicial"
              placeholder="Selecciona una fecha"
              value={fechaInicio}
              onChange={setFechaInicio}
            />
            <CalendarDateField
              label="Fecha final"
              placeholder="Selecciona una fecha"
              value={fechaFin}
              onChange={setFechaFin}
            />
          </View>

          {rangoInvalido ? (
            <Text style={styles.errorFiltro}>
              La fecha inicial no puede ser mayor que la fecha final.
            </Text>
          ) : null}

          <TouchableOpacity style={styles.limpiarBoton} onPress={limpiarFiltros}>
            <Text style={styles.limpiarBotonTexto}>Limpiar filtros</Text>
          </TouchableOpacity>
        </View>

        {cargando ? <Text style={styles.estado}>Cargando gastos...</Text> : null}
        {!cargando && error ? <Text style={styles.error}>{error}</Text> : null}
        {!cargando && !error && gastos.length === 0 ? (
          <Text style={styles.estado}>Aun no has registrado gastos.</Text>
        ) : null}
        {!cargando && !error && gastos.length > 0 && !rangoInvalido ? (
          <Text style={styles.resultadosTexto}>
            Mostrando {gastosFiltrados.length} gasto(s).
          </Text>
        ) : null}

        {!cargando && !error && !rangoInvalido && gastosFiltrados.length === 0 && gastos.length > 0 ? (
          <Text style={styles.estado}>No hay gastos para los filtros seleccionados.</Text>
        ) : null}

        {!cargando && !error && !rangoInvalido && gastosFiltrados.length > 0
          ? gastosFiltrados.map((gasto) => (
              <View key={gasto.id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.nombre}>{gasto.nombre}</Text>
                  <Text style={styles.monto}>${gasto.monto.toFixed(2)}</Text>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.meta}>{gasto.categoria || 'Sin categoria'}</Text>
                  <Text style={styles.meta}>{formatearFecha(gasto.fecha)}</Text>
                </View>
              </View>
            ))
          : null}

        {!cargando && !error && !rangoInvalido && gastosFiltrados.length > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalMonto}>${totalFiltrado.toFixed(2)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  historialCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tituloContainer: {
    backgroundColor: '#1A4F7A',
    marginHorizontal: -20,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filtrosContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  filtrosTitulo: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filtroLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoriasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoriaChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoriaChipActiva: {
    backgroundColor: '#007BFF',
  },
  categoriaChipTexto: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  categoriaChipTextoActivo: {
    color: '#FFFFFF',
  },
  fechasRow: {
    flexDirection: 'row',
    gap: 10,
  },
  errorFiltro: {
    color: '#C62828',
    fontSize: 13,
    marginTop: 10,
  },
  limpiarBoton: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  limpiarBotonTexto: {
    color: '#007BFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  estado: {
    color: '#666',
    fontSize: 14,
  },
  error: {
    color: '#C62828',
    fontSize: 14,
  },
  resultadosTexto: {
    color: '#475569',
    fontSize: 13,
    paddingBottom: 12,
    marginBottom: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#0F172A',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#0F172A',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalMonto: {
    color: '#007BFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  monto: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  meta: {
    color: '#666',
    fontSize: 13,
  },
});

export default HistorialGastos;