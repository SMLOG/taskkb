
let globalAuthDlg;
let globalNoFoundDlg;
let globalDlg;
export function useDialog(authDlg,noFound,dlg) {

  if(authDlg){
    globalAuthDlg = authDlg;
  }
  if(noFound){
    globalNoFoundDlg = noFound;
  }
  if(dlg)
    globalDlg = dlg;

  function dialog(){
    return globalDlg.value;
  }
  return {globalAuthDlg,globalNoFoundDlg,dialog};
}