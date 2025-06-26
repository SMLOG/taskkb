import { useDialog } from "./useDialog";

export  async function showNotification(message, type) {
  return useDialog().notification().open({ message, type });

}