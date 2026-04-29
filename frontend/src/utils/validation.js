export const validatePassword = (password) => {
  if (password.length < 6) {
    return "Password phải có ít nhất 6 ký tự";
  }
  if (!/[A-Z]/.test(password)) {
    return "Phải có ít nhất 1 chữ in hoa";
  }
  if (!/[a-z]/.test(password)) {
    return "Phải có ít nhất 1 chữ thường";
  }
  if (!/\d/.test(password)) {
    return "Phải có ít nhất 1 chữ số";
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-\\/]/.test(password)) {
    return "Phải có ít nhất 1 ký tự đặc biệt";
  }
  return null;
};

export const isValidNumberInput = (value) => {
  return /^[0-9]*\.?[0-9]*$/.test(value);
};

export const isScoreInRange = (value) => {
  if (value === "" || value === ".") return true;
  const num = parseFloat(value);
  return num >= 0 && num <= 10;
};