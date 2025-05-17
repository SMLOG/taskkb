import { ref } from "vue";

const isDrag = ref(false);

export function useComp() {

  return {
    isDrag
  };
}
