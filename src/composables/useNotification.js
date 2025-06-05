import { ref } from 'vue';

const useNotification = () => {
  const notification = ref(null);

  const showNotification = (message, type) => {
    console.log(message,type)
    notification.value = { message, type };
    setTimeout(() => {
      notification.value = null;
    }, 3000);
  };

  return {
    notification,
    showNotification,
  };
};

export default useNotification;