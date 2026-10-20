export interface ScheduleBlock {
  /** 24h "HH:MM", inclusive */
  start: string;
  /** 24h "HH:MM", exclusive */
  end: string;
  show: string;
  producer: string;
  content: string;
}

export interface ScheduleDay {
  key: string;
  label: string;
  short: string;
  blocks: ScheduleBlock[];
}

const b = (
  start: string,
  end: string,
  show: string,
  producer: string,
  content: string
): ScheduleBlock => ({ start, end, show, producer, content });

// Bloques comunes de lunes a viernes (Parrilla Columbia, noviembre 2026)
const weekdayMorning: ScheduleBlock[] = [
  b('00:00', '00:05', 'Oración / Reflexión', 'Producción Columbia', 'Formación'),
  b('00:05', '00:25', 'Cuentos y Leyendas', 'Producción Columbia', 'Producción Columbia'),
  b('00:25', '02:00', 'Programación Musical', 'Cabina', 'Música'),
  b('02:00', '03:00', 'Programación Musical', 'Cabina', 'Producción Columbia'),
  b('03:00', '04:00', 'Con Sabor Ranchero', 'Cabina', 'Música ranchera'),
  b('04:00', '05:00', 'El Agropecuario', 'Miguel A. Grillo', 'Ganadería / Agricultura'),
  b('05:00', '05:12', 'Tres Patines', 'Cabina', 'Humor'),
  b('05:15', '05:30', 'Programación Musical', 'Cabina', 'Música'),
  b('05:30', '07:00', 'Noticias Columbia 1ra.', 'Primero lo Primero, Óscar y Jenny', 'Informativo'),
  b('07:00', '08:00', 'Columbia Deportiva', 'Deportes Eduardo Baldares', 'Deportes'),
  b('08:00', '09:00', 'A Propósito', 'Doriam Díaz y Víctor Fernández', 'Opinión / Varios'),
];

const weekdayMidday: ScheduleBlock[] = [
  b('10:00', '11:30', 'Encuentro Deportivo', 'Yashín Quesada', 'Temas varios, deportes'),
  b('11:30', '13:00', 'Mesa Servida', 'Producción Columbia', 'Noticias y deportes'),
  b('13:00', '14:00', 'Visión Radio', 'Atim Roper y Andrey Campos', 'Deportes / Varios'),
  b('14:00', '15:00', 'Punto Decisivo', 'Deportes Eduardo Baldares', 'Deportes'),
  b('15:00', '16:00', 'Por Tres Razones', 'Evelyn Fashler', 'Noticias'),
  b('16:00', '17:00', 'Caravana Deportiva Columbia', 'Eduardo Baldares', 'Deportes / Opinión'),
  b('17:00', '18:00', 'En Síntesis', 'Producción Columbia', 'Noticias'),
];

const nightMusic = [
  b('22:00', '22:25', 'Tres Patines', 'Cabina Columbia', 'Humor'),
  b('22:30', '24:00', 'Música', 'Cabina Columbia', 'Cabina Columbia'),
];

const porGoleada = (end: string, producer = 'Claudio Cicica') =>
  b('09:00', end, 'Por Goleada', producer, 'Deportes varios');

const lunes: ScheduleBlock[] = [
  ...weekdayMorning,
  porGoleada('10:00'),
  ...weekdayMidday,
  b('18:00', '18:25', 'Frecuencia MP', 'Fiscalía', 'Fiscalía'),
  b('18:30', '18:55', 'Gente Gerente', 'Lic. Francisco Villalobos', 'Tributación'),
  b('19:00', '19:25', 'Doble Clic', 'José Porras', 'Tecnología'),
  b('19:30', '20:25', 'Pitazo Caliente', 'Rodolfo Méndez y Walter Quesada', 'Arbitraje'),
  b('20:30', '20:55', 'Con el Comité Olímpico Nacional', 'Comité Olímpico Nacional', 'Deportes'),
  b('21:00', '22:00', 'Hablemos de Sexo', 'Dr. Mauro / Walter Zúñiga', 'Sexología'),
  ...nightMusic,
];

const transmisiones = b('18:00', '21:00', 'Transmisiones Deportivas', 'Transmisiones deportivas', 'Deportes');
const musicaNoche = b('21:00', '22:00', 'Música', 'Cabina Columbia', 'Cabina Columbia');

const martes: ScheduleBlock[] = [
  ...weekdayMorning,
  porGoleada('10:00'),
  ...weekdayMidday,
  transmisiones,
  musicaNoche,
  ...nightMusic,
];

const jueves: ScheduleBlock[] = [
  ...weekdayMorning,
  porGoleada('10:00'),
  ...weekdayMidday,
  b('18:00', '19:00', 'Columbia Ciclismo', 'Rodolfo Méndez', 'Deportes'),
  transmisiones,
  musicaNoche,
  ...nightMusic,
];

const viernes: ScheduleBlock[] = [
  ...weekdayMorning,
  porGoleada('09:40'),
  b('09:45', '10:00', 'Caja Noticias Radio', 'CCSS', 'Información de la C.C.S.S.'),
  ...weekdayMidday,
  b('18:00', '18:25', 'Turisteando', 'Doris Falconer', 'Turismo'),
  b('18:30', '18:55', 'Salud y Deportes', 'Rodolfo Méndez', 'Varios'),
  b('19:00', '19:55', 'Pitazo Caliente', 'Rodolfo Méndez y Walter Quesada', 'Arbitraje'),
  b('20:00', '20:55', 'Música (Transmisiones Deportivas)', 'Cabina Columbia', 'Cabina Columbia'),
  musicaNoche,
  ...nightMusic,
];

const sabado: ScheduleBlock[] = [
  b('00:00', '00:05', 'Oración / Reflexión', 'Columbia', 'Formación'),
  b('00:05', '03:00', 'Música', 'Columbia', 'Música variada'),
  b('03:00', '04:00', 'Con Sabor Ranchero / Producción Columbia', 'Columbia', 'Música ranchera'),
  b('04:00', '05:00', 'El Agropecuario', 'Miguel A. Grillo', 'Ganadería / Agro'),
  b('05:00', '05:12', 'Tres Patines', 'P: Columbia', 'Humor'),
  b('05:15', '06:00', 'Cuentos y Leyendas', 'Columbia', 'Relatos'),
  b('06:00', '07:00', 'Informativo + Resumen', 'Producción Noticias', 'Noticias'),
  b('07:00', '08:00', 'Tiempo de Juego', 'Marvin Centeno', 'Deportes'),
  b('08:00', '09:00', 'Tiempos de Cambio', 'Jaime Peña', 'Opinión'),
  b('09:00', '10:00', 'Construradio', 'Eduardo Méndez', 'Construcción'),
  b('10:00', '11:00', 'Todo Deporte', 'Luis Echavarría', 'Deportes varios'),
  b('11:00', '12:00', 'Infobyte', 'Sylvia Rojas', 'Tecnología'),
  b('12:00', '12:30', 'Informativo + Agenda', 'Producción Columbia', 'Noticias'),
  b('12:30', '13:00', 'Total Sports', 'Mauricio Quesada', 'Producción Columbia'),
  b('13:00', '14:00', 'Planeta Fútbol', 'Jimena Rodríguez', 'Producción Columbia'),
  b('14:00', '15:00', 'Música', 'Cabina Columbia', 'Cabina Columbia'),
  b('15:00', '16:00', 'Soluciones', 'Maureen Herra', 'Psicología'),
  b('16:00', '17:00', 'De Todo un Poco y Algo Más', 'Walter Zúñiga', 'Varios'),
  b('17:00', '18:00', 'Música', 'Cabina Columbia', 'Cabina Columbia'),
  b('18:00', '23:00', 'Deportivas Columbia (programación y/o musical, sujeto a cambios)', 'Deportes varios', 'Producción Columbia'),
  b('23:00', '24:00', 'Transmisiones deportivas y/o programación musical', 'Columbia', 'Producción Cabina'),
];

const domingo: ScheduleBlock[] = [
  b('00:00', '05:00', 'Programación Musical', 'P. Columbia', 'Música'),
  b('05:00', '05:30', 'Tres Patines u otros', 'Cabina', 'Humor'),
  b('05:30', '06:30', 'Programación Musical', 'P. Columbia', 'Música'),
  b('06:30', '07:00', 'Luz en mi Sendero', 'P. Álvaro Sáenz', 'Reflexiones'),
  b('07:00', '08:00', 'Reflexión', 'Varios', 'Reflexión'),
  b('08:00', '09:00', 'Una Vuelta a la Manzana', 'Marianella Cordero', 'Deportes varios'),
  b('09:00', '10:00', 'La Jugada Perfecta', 'Estudiantes ULatina', 'Deportes varios'),
  b('10:00', '20:30', 'Transmisiones Deportivas (sujeto a cambios)', 'Columbia', 'Deportes'),
  b('20:30', '23:00', 'Lo Mejor del Deporte y Polémica', 'Deportes / Varios', 'Jaime Peña'),
  b('23:30', '24:00', 'Programación Musical', 'Cabina', 'Cabina'),
];

export const SCHEDULE: ScheduleDay[] = [
  { key: 'lunes', label: 'Lunes', short: 'Lun', blocks: lunes },
  { key: 'martes', label: 'Martes', short: 'Mar', blocks: martes },
  { key: 'miercoles', label: 'Miércoles', short: 'Mié', blocks: martes },
  { key: 'jueves', label: 'Jueves', short: 'Jue', blocks: jueves },
  { key: 'viernes', label: 'Viernes', short: 'Vie', blocks: viernes },
  { key: 'sabado', label: 'Sábado', short: 'Sáb', blocks: sabado },
  { key: 'domingo', label: 'Domingo', short: 'Dom', blocks: domingo },
];
