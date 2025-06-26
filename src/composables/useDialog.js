let globalDlg;
let globalNotification;
export function useDialog(dlg,notify) {


  if(dlg)
    globalDlg = dlg;
  if(notify)
    globalNotification = notify;
  function dialog(){
    return globalDlg.value;
  }
  function notification(){
    return globalNotification.value;
  }
  return {dialog,notification};
}