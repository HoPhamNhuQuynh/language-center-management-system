export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const normalized = dateStr.replace(" ", "T").split(".")[0];

  const date = new Date(normalized);
  return isNaN(date) ? "—" : date.toLocaleDateString("vi-VN");
};
