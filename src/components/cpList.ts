
import { ref } from 'vue';
import ColTitle from '@/components/ColTitle.vue';
import ColDropText from '@/components/ColDropText.vue';
import ColDate from '@/components/ColDate.vue';
import StartDate from '@/components/StartDate.vue';
import ColSeq from '@/components/ColSeq.vue';
const componentMap = {
  ColTitle,
  ColDropText,
  ColDate,
  ColSeq,
  StartDate
};
// Resolve component dynamically
export function resolveComponent(cp) {
  return componentMap[cp] || null; // Fallback to null if component not found
};

export const cpList = ref<string[]>(['ColTitle', 'ColDropText', 'ColDate', 'Time', 'ColSeq','StartDate']);
