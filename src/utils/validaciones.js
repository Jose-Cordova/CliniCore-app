// utils/validaciones.js

/**
 * Valida que un nombre o apellido contenga solo letras (incluyendo tildes),
 * espacios, apóstrofes y guiones. No permite números ni otros caracteres.
 */
export const validarNombreApellido = (valor) => {
  if (!valor || valor.trim().length < 2) {
    return 'Debe tener al menos 2 letras';
  }
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/;
  if (!regexx.test(valor)) {
    return 'Solo se permiten letras, espacios, tildes y apóstrofes';
  }
  return '';
};

/**
 * Valida el formato de un DUI salvadoreño: 8 dígitos + guion + 1 dígito.
 */
export const validarFormatoDUI = (dui) => /^\d{8}-\d{1}$/.test(dui);

/**
 * Valida el DUI completo usando el algoritmo de dígito verificador.
 */
export const validarDuiLocal = (dui) => {
  if (!validarFormatoDUI(dui)) return false;

  const digitos = dui.replace('-', '').split('').map(Number);
  const FACTORES_DUI = [9, 8, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += digitos[i] * FACTORES_DUI[i];
  }

  const residuo = suma % 10;
  const digitoCalculado = (10 - residuo) % 10;

  return digitos[8] === digitoCalculado;
};

/**
 * Valida un teléfono salvadoreño: exactamente 8 dígitos,
 * ignorando espacios, guiones o paréntesis.
 */
export const validarTelefonoElSalvador = (telefono) => {
  const soloDigitos = telefono.replace(/\D/g, '');
  return /^\d{8}$/.test(soloDigitos);
};

/**
 * Valida que un email tenga formato correcto.
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida que la contraseña cumpla: mínimo 8 caracteres,
 * al menos una mayúscula, una minúscula, un número y un símbolo.
 */
export const validarContrasena = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};