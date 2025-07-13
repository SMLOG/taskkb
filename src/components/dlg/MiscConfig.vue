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
          Enable Emoji
          <button
            class="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400"
            @click="pickEmoji">
            {{ config.emoji || 'Pick Emoji' }}
          </button>

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
import { showDialog } from "@/composables/useSystem";
import Description from "./Description.vue";

const emit = defineEmits(["confirm", "cancel"]);

const emojiInput = ref<string>("");

const appStore = useAppStore();

const config = computed(() => appStore.configRef);



async function pickEmoji() {


  const selectEmoj = await showDialog(await import('@/components/dlg/EmojPicker.vue'));
  if (selectEmoj) {
    config.value.emoji = selectEmoj.i  }

}

const showDescription = async () => {
  await showDialog(Description);
};


watch(
  () => config.value.emoji,
  (newEmoji) => {
    emojiInput.value = newEmoji || "";
  },
  { immediate: true }
);

</script>

