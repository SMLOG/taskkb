<template>
  <div v-if="row" class="h-full">
    <ContentEditableDate
      v-model="date"
      :dropdownItems="col.options"
      @change="handleChange"
    ></ContentEditableDate>
  </div>
  <div v-else-if="col" class="h-full">
    <ContentEditable v-model="col.name" :isText="true"></ContentEditable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ContentEditableDate from './sub/ContentEditableDate.vue';
import ContentEditable from './sub/ContentEditable.vue';
import { format } from 'date-fns';

const props = defineProps({
  col: {
    type: Object,
  },
  row: {
    type: Object,
    required: false,
  },
});

const emit = defineEmits(['change']);

const date = ref('');

const getValue = () => {
  if (props.row?._tl?.start) {
    date.value = format(props.row._tl.start, 'yyyy-MM-dd');
  }
};

const handleChange = (oldVal, newVal) => {
  emit('change', oldVal, newVal);
};

onMounted(() => {
  getValue();
});

watch(
  () =>props.row?._tl,
  () => {
    getValue();
  }
);
</script>

<style></style>