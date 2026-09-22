export const SUCCESS_EVENT = "idola:success";
export const SUCCESS_STORAGE_KEY = "idola:success-pending";

export type SuccessVariant =
  | "celebrate"
  | "star"
  | "camera"
  | "copy"
  | "upload"
  | "admin"
  | "delete"
  | "login"
  | "share";

export type SuccessPayload = {
  message: string;
  variant: SuccessVariant;
  title?: string;
  createdAt: number;
};

export function showSuccess(
  message: string,
  variant: SuccessVariant = "celebrate",
  title?: string,
) {
  const payload: SuccessPayload = {
    message,
    variant,
    title,
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem(SUCCESS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // The live event still works when storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(SUCCESS_EVENT, { detail: payload }));
}
