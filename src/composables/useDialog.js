let globalDlg;
export function useDialog(dlg) {


  if(dlg)
    globalDlg = dlg;

  function dialog(){
    return globalDlg.value;
  }
  return {dialog};
}