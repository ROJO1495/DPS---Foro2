import { useState } from 'react';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validate = (email, password, isRegister = false, confirmPassword = null) => {
    let currentErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) currentErrors.email = 'Email invalido';
    if (password.length < 6) currentErrors.password = 'Minimo 6 caracteres';
    
    if (isRegister && password !== confirmPassword) {
      currentErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  return { errors, validate };
};