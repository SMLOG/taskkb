
let globalAuthDlg
let globalNoFoundDlg
export function useAuthDialog(authDlg,noFound) {

  if(authDlg){
    globalAuthDlg = authDlg;
  }
  if(noFound){
    globalNoFoundDlg = noFound;
  }

  return {globalAuthDlg,globalNoFoundDlg};
}