import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';
const useApp = () => {
  const refs= storeToRefs(useAppStore());
  return {
    ...refs
  };
};

export default useApp;