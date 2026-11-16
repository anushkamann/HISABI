export const formatINR = (n) => {
  const num = Number(n) || 0;

  return `₹${Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};