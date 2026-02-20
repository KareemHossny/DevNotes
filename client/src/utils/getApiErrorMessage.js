const getApiErrorMessage = (error, fallbackMessage = "Something went wrong") => {
  if (!error) return fallbackMessage;

  const data = error.response?.data;

  if (typeof data?.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export default getApiErrorMessage;
