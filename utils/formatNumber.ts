export const formatValue = (value: number | string) => {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  if (isNaN(value)) {
    return value.toString();
  }
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
};
