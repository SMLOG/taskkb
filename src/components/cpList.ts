
import { ref } from 'vue';
import ColTitle from '@/components/field/ColTitle.vue';
import ColDropText from '@/components/field/ColDropText.vue';
import ColDate from '@/components/field/ColDate.vue';
import StartDate from '@/components/field/StartDate.vue';
import ColSeq from '@/components/field/ColSeq.vue';
import ColCheck from '@/components/field/ColCheck.vue';
import Col3Check from '@/components/field/Col3Check.vue';
const componentMap = {
  ColTitle,
  ColDropText,
  ColDate,
  ColSeq,
  StartDate,
  ColCheck,
  Col3Check
};
// Resolve component dynamically
export function resolveComponent(cp) {
  return componentMap[cp] || null; // Fallback to null if component not found
};

export const cpList = ref([
  { type: 'ColSeq', name: "SN" },
  { type: 'ColTitle', name: "Title" },
  { type: 'ColDropText', name: "Text" },
  { type: 'ColDate', name: "Date" },
  { type: 'StartDate', name: "Start date" },
  { type: 'ColCheck', name: "CheckBox" },
  { type: 'Col3Check', name: "checkBox(fail,checked,emtpy)" }
]);
