
import { ref } from 'vue';
import ColTitle from '@/components/field/ColTitle.vue';
import ColDropText from '@/components/field/ColDropText.vue';
import ColDate from '@/components/field/ColDate.vue';
import StartDate from '@/components/field/StartDate.vue';
import ColSeq from '@/components/field/ColSeq.vue';
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
