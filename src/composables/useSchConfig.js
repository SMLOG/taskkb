import { ref } from 'vue';
import { useAppStore } from '@/stores/appStore';
import { storeToRefs } from 'pinia';
const useSchConfig = () => {
  const {configRef} = storeToRefs(useAppStore());

  const showSchCoonfig = (message, type) => {
    console.log(message,type)
    notification.value = { message, type };
    setTimeout(() => {
      notification.value = null;
    }, 3000);
  };

  return {
    showSchCoonfig: showSchCoonfig,
    configRef
  };
};

export default useSchConfig;