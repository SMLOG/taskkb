// vars.js
import { ref } from "vue";

// Shared refs
export const weeksRef = ref([]);
export const selectDepthsRef = ref([]);
export const selectDepths = selectDepthsRef.value;
export const selectStartRef = ref(null);
export const isDrag = ref(false);
export const dragMode = ref(false);
export const moveType = ref(null);
export const enableSelectionTimeout = ref(0);
export const enableDragTimeout = ref(0);

// Shared non-reactive variables
export const  config = ref(null);
export const dragStartClientX= ref(null);
export const isMouseDown= ref(null);
export const selectDetphStart= ref(null);
export const selectDetphEnd= ref(null);