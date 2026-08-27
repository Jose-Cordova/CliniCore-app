import Swal from 'sweetalert2';

const baseConfig = {
  confirmButtonColor: '#2563EB', // primary
  cancelButtonColor: '#EF4444', // danger
  timer: 3000,
  timerProgressBar: true,
};

export const alertaExito = (titulo, mensaje = '') =>
  Swal.fire({ icon: 'success', title: titulo, text: mensaje, ...baseConfig });

export const alertaError = (titulo, mensaje = '') =>
  Swal.fire({ icon: 'error', title: titulo, text: mensaje, ...baseConfig });

export const alertaConfirmacion = (titulo, mensaje = '') =>
  Swal.fire({
    title: titulo,
    text: mensaje,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    ...baseConfig,
  }).then((result) => result.isConfirmed);