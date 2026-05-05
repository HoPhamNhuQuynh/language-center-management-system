export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const normalized =
    typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;

  const date = new Date(normalized);

  if (isNaN(date.getTime())) {
    return "—";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
