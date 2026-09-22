export const SUCCESS_EVENT = "idola:success";
export const SUCCESS_STORAGE_KEY = "idola:success-pending";

export function showSuccess(message: string) {
  try {
    sessionStorage.setItem(
      SUCCESS_STORAGE_KEY,
      JSON.stringify({ message, createdAt: Date.now() }),
    );
  } catch {
    // The live event still works when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(SUCCESS_EVENT, { detail: message }));
}
