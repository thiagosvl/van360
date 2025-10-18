export const safeOpenDialog = (callback: () => void, time?: number) => {
  time = time ?? 25;
  document.body.click();
  setTimeout(callback, time);
};