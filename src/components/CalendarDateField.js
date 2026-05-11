import React, { useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const NOMBRES_DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const formatearFecha = (fecha) => {
  if (!fecha) {
    return '';
  }

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

const sonMismaFecha = (fechaA, fechaB) => {
  if (!fechaA || !fechaB) {
    return false;
  }

  return (
    fechaA.getDate() === fechaB.getDate() &&
    fechaA.getMonth() === fechaB.getMonth() &&
    fechaA.getFullYear() === fechaB.getFullYear()
  );
};

const obtenerIndiceLunes = (fecha) => {
  const dia = fecha.getDay();
  return dia === 0 ? 6 : dia - 1;
};

const CalendarDateField = ({ label, placeholder, value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [mesVisible, setMesVisible] = useState(() => value || new Date());

  const abrirCalendario = () => {
    setMesVisible(value || new Date());
    setVisible(true);
  };

  const celdasCalendario = useMemo(() => {
    const anio = mesVisible.getFullYear();
    const mes = mesVisible.getMonth();
    const primerDia = new Date(anio, mes, 1);
    const diasMes = new Date(anio, mes + 1, 0).getDate();
    const espaciosIniciales = obtenerIndiceLunes(primerDia);
    const celdas = [];

    for (let indice = 0; indice < espaciosIniciales; indice += 1) {
      celdas.push(null);
    }

    for (let dia = 1; dia <= diasMes; dia += 1) {
      celdas.push(new Date(anio, mes, dia));
    }

    while (celdas.length % 7 !== 0) {
      celdas.push(null);
    }

    return celdas;
  }, [mesVisible]);

  const cambiarMes = (direccion) => {
    setMesVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + direccion, 1));
  };

  const seleccionarFecha = (fecha) => {
    onChange(fecha);
    setVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.campo} onPress={abrirCalendario}>
        <Text style={value ? styles.valor : styles.placeholder}>
          {value ? formatearFecha(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.navButton} onPress={() => cambiarMes(-1)}>
                <Text style={styles.navButtonText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {NOMBRES_MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
              </Text>
              <TouchableOpacity style={styles.navButton} onPress={() => cambiarMes(1)}>
                <Text style={styles.navButtonText}>{'>'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekdaysRow}>
              {NOMBRES_DIAS.map((dia) => (
                <Text key={dia} style={styles.weekdayText}>
                  {dia}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {celdasCalendario.map((fecha, indice) => {
                if (!fecha) {
                  return <View key={`vacio-${indice}`} style={styles.dayCell} />;
                }

                const estaSeleccionada = sonMismaFecha(fecha, value);

                return (
                  <TouchableOpacity
                    key={fecha.toISOString()}
                    style={[
                      styles.dayCell,
                      styles.dayButton,
                      estaSeleccionada ? styles.dayButtonActive : null,
                    ]}
                    onPress={() => seleccionarFecha(fecha)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        estaSeleccionada ? styles.dayTextActive : null,
                      ]}
                    >
                      {fecha.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => onChange(null)}>
                <Text style={styles.footerAction}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.footerAction}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  placeholder: {
    color: '#999',
    fontSize: 14,
  },
  valor: {
    color: '#1E293B',
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayCell: {
    width: '14.2857%',
    maxWidth: '14.2857%',
    minWidth: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayButton: {
    borderRadius: 999,
  },
  dayButtonActive: {
    backgroundColor: '#007BFF',
  },
  dayText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  footerAction: {
    color: '#007BFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CalendarDateField;