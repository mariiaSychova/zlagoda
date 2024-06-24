import { format, parse } from "date-fns";

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return format(new Date(dateString), "dd.MM.yyyy");
};

export const parseDate = (formattedDate: string | undefined): string => {
  if (!formattedDate) return "";
  try {
    return format(
      parse(formattedDate, "dd.MM.yyyy", new Date()),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
    );
  } catch (error) {
    console.error("Error parsing date:", error);
    return "";
  }
};

export const formatDateFull = (dateString: string) => {
  if (!dateString) return "";
  return format(new Date(dateString), "dd-MM-yyyy' 'HH:mm:ss");
};
