import { useDialog } from "./useDialog";

export  async function showNotification(message, type) {
  return useDialog().notification().open({ message, type });

}
export  async function showDialog(component,params,dlgOption) {
  return useDialog().dialog().open(component,params,dlgOption);

}
