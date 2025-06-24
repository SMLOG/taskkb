
let globalAuthDlg
let globalNoFoundDlg
export function useDialog(authDlg,noFound) {

  if(authDlg){
    globalAuthDlg = authDlg;
  }
  if(noFound){
    globalNoFoundDlg = noFound;
  }

  return {globalAuthDlg,globalNoFoundDlg};
}