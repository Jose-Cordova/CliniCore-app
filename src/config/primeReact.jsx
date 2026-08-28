import { PrimeReactProvider, addLocale } from 'primereact/api';
// Importa los componentes que usarás en la app
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog } from 'primereact/confirmdialog';

// Configuración del idioma español para PrimeReact
addLocale('es', {
  startsWith: 'Empieza con',
  contains: 'Contiene',
  notContains: 'No contiene',
  endsWith: 'Termina con',
  equals: 'Igual',
  notEquals: 'No igual',
  noFilter: 'Sin filtro',
  filter: 'Filtro',
  lt: 'Menor que',
  lte: 'Menor o igual que',
  gt: 'Mayor que',
  gte: 'Mayor o igual que',
  dateIs: 'Fecha es',
  dateIsNot: 'Fecha no es',
  dateBefore: 'Fecha es antes',
  dateAfter: 'Fecha es después',
  custom: 'Personalizado',
  clear: 'Limpiar',
  apply: 'Aplicar',
  matchAll: 'Coincidir con todos',
  matchAny: 'Coincidir con cualquiera',
  addRule: 'Agregar regla',
  removeRule: 'Eliminar regla',
  accept: 'Sí',
  reject: 'No',
  choose: 'Escoger',
  upload: 'Subir',
  cancel: 'Cancelar',
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  monthNames: [
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
  ],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  today: 'Hoy',
  weekHeader: 'Sem',
  firstDayOfWeek: 1,
  showMonthAfterYear: false,
  dateFormat: 'dd/mm/yy',
  weak: 'Débil',
  medium: 'Medio',
  strong: 'Fuerte',
  passwordPrompt: 'Escriba una contraseña',
  emptyFilterMessage: 'No se encontraron resultados',
  searchMessage: '{0} resultados disponibles',
  selectionMessage: '{0} elementos seleccionados',
  emptySelectionMessage: 'No hay elementos seleccionados',
  emptySearchMessage: 'No se encontraron resultados',
  emptyMessage: 'No hay opciones disponibles',
});

// Configuración global de PrimeReact
const primeReactConfig = {
  ripple: true,
  inputStyle: 'filled',
  locale: 'es',
};

// Componente Provider listo para usar en main.jsx
const AppPrimeReactProvider = ({ children }) => (
  <PrimeReactProvider value={primeReactConfig}>
    {children}
  </PrimeReactProvider>
);

// Exporta todo
export {
  AppPrimeReactProvider,
  Button,
  InputText,
  Password,
  Card,
  Dialog,
  Toast,
  Dropdown,
  Calendar,
  DataTable,
  Column,
  Tag,
  Toolbar,
  ConfirmDialog,
  // ... más componentes
};