
let globalAuthDlg
export function useAuthDialog(authDlg) {

  if(authDlg){
    globalAuthDlg = authDlg;
  }

  return {globalAuthDlg};
}