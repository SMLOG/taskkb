<template>
      <!-- General Settings -->
      <div
        class="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-6 sticky!important bottom-0 bg-white dark:bg-gray-800">
        <label class="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
          <input type="checkbox" v-model="config.showSch"
            class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
          Show Schedule
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
          <input type="checkbox" v-model="config.icon"
            class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400" />
          Emoji
          <input v-if="config.icon" type="text" v-model="emojiInput" @input="validateEmoji" @blur="handleBlur"
            class="w-16 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 text-sm py-1.5 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            placeholder="😊" maxlength="4" aria-label="Enter an emoji" />
          <span v-if="emojiError" class="text-red-500 dark:text-red-400 text-xs">{{ emojiError }}</span>
        </label>

        <label class="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-300">
          <button
            class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
            @click="showDescription">
            Description
          </button>
        </label>
      </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useAppStore } from "@/stores/appStore";
import { debounce } from "lodash";
import { showDialog } from "@/composables/useSystem";
import Description from "./Description.vue";

const emit = defineEmits(["confirm", "cancel"]);

const emojiInput = ref<string>("");
const emojiError = ref<string>("");

const appStore = useAppStore();

const config = computed(() => appStore.configRef);



const showDescription = async () => {
  await showDialog(Description);
};

// Emoji validation regex (basic, covers most common emojis)
const emojiRegex =
  /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B50}\u{2B55}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
// Debounced update function
const debouncedUpdateEmoji = debounce((emoji: string) => {
  appStore.updateTabEmoj(config.value.icon, emoji);
}, 300);

// Validate emoji input
const validateEmoji = (event: Event) => {
  const input = (event.target as HTMLInputElement).value;
  emojiError.value = "";

  if (input && !emojiRegex.test(input)) {
    emojiError.value = "Please enter a valid emoji";
    return;
  }

  emojiInput.value = input;
  debouncedUpdateEmoji(input);
};

// Handle blur event to reset invalid emoji input
const handleBlur = () => {
  if (emojiInput.value && !emojiRegex.test(emojiInput.value)) {
    emojiInput.value = "";
    emojiError.value = "";
    debouncedUpdateEmoji("");
  }
};

// Sync emojiInput with config.emoji
watch(
  () => config.value.emoji,
  (newEmoji) => {
    emojiInput.value = newEmoji || "";
  },
  { immediate: true }
);

// Watch for config changes
watch(
  () => [config.value.icon, config.value.emoji],
  () => {
    if (!config.value.icon) {
      emojiInput.value = "";
      emojiError.value = "";
      debouncedUpdateEmoji("");
    } else if (config.value.emoji) {
      emojiInput.value = config.value.emoji;
      debouncedUpdateEmoji(config.value.emoji);
    }
  },
  { immediate: true }
);




</script>

<style scoped>
@import "@/assets/main.css";

.config-container {
  max-width: 1200px;
}

/* Ensure inputs, selects, and checkboxes have consistent styling */
input[type="text"],
select,
input[type="checkbox"] {
  transition: all 0.2s ease-in-out;
}

input[type="text"] {
  @apply rounded border-gray-500;
}

/* Add hover effects for draggable items */
[draggable="true"]:hover {
  cursor: move;
}

/* Smooth transition for popup appearance */
.fixed {
  animation: fadeIn 0.3s ease-in-out;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>