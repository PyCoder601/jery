export const addHistoryLine = (
  text: string,
  isUserInput = false,
  type: "text" | "password" = "text",
) => ({
  text,
  isUserInput,
  type,
  timestamp: new Date().toLocaleTimeString(),
});
