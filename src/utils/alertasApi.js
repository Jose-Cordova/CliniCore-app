// utils/alertasApi.js

/**
 * Determina la severidad del Toast según el status HTTP.
 * - 400, 403, 404, 409 → warning (advertencia)
 * - Otros → error
 * Si se desea agregar más códigos, se actualiza aquí.
 */
const obtenerServerPorStatus = (status) => {
  if ([400, 403, 404, 409].includes(status)) {
    return 'warn';
  }
  return 'error';
};

/**
 * Muestra un Toast de error basado en la respuesta de Axios.
 * @param {React.RefObject} toastRef - referencia al componente <Toast />
 * @param {Error} error - error capturado en try/catch
 * @param {string} msjPorDefecto - mensaje si la API no devuelve uno
 */
export const mostrarErrorApi = (toastRef, error, msjPorDefecto = 'Ocurrió un error inesperado') => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || msjPorDefecto;
  const severity = obtenerServerPorStatus(status);

  toastRef?.current?.show({
    severity,
    summary: severity === 'warn' ? 'Atención' : 'Error',
    detail: message,
    life: severity === 'warn' ? 4000 : 5000,
  });
};

/**
 * Muestra un Toast de éxito.
 * @param {React.RefObject} toastRef - referencia al componente <Toast />
 * @param {string} msj - mensaje a mostrar
 */
export const mostrarExitoApi = (toastRef, msj, duracion = 4000) => {
  toastRef?.current?.show({
    severity: 'success',
    summary: 'Éxito',
    detail: msj,
    life: duracion,
  });
};

/**
 * Muestra un Toast de advertencia personalizada (útil para validaciones).
 * @param {React.RefObject} toastRef
 * @param {string} msj
 */
export const mostrarAdvertenciaApi = (toastRef, msj) => {
  toastRef?.current?.show({
    severity: 'warn',
    summary: 'Advertencia',
    detail: msj,
    life: 4000,
  });
};