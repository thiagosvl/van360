const cleanBodyLock = () => {
  document.body.click();
  document.body.style.pointerEvents = 'auto';
  document.body.classList.remove("_react-remove-scroll-bar", "react-remove-scroll-bar");
};

export const safeCloseDialog = (callback: () => void, time?: number) => {
  time = time ?? 25;

  document.body.click();

  setTimeout(() => {
    callback();
    setTimeout(() => {
      cleanBodyLock();
    }, time);

  }, time);
};