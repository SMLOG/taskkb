<template>

<div class="text-truncate">
  <p v-if="isTruncated && !showFullText" class="truncate-text">
    {{ truncatedText }}
    <span v-if="text.length > charLimit" class="more-link" @click="toggleText">... Show More</span>
  </p>
  <p v-else class="full-text">
    {{ text }}
    <span v-if="text.length > charLimit" class="less-link" @click="toggleText"> Show Less</span>
  </p>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
text: {
  type: String,
  required: true
},
charLimit: {
  type: Number,
  default: 100
}

});

const showFullText = ref(false)

const isTruncated = computed(() => props.text.length > props.charLimit)

const truncatedText = computed(() => {
if (props.text.length <= props.charLimit) return props.text
return props.text.slice(0, props.charLimit).trim()
})

const toggleText = () => {
showFullText.value = !showFullText.value
}
</script>

<style scoped>
.text-truncate {
max-width: 100%;
}

.truncate-text,
.full-text {
margin: 0;
line-height: 1.5;
}

.more-link,
.less-link {
color: #007bff;
cursor: pointer;
font-weight: 500;
}

.more-link:hover,
.less-link:hover {
text-decoration: underline;
}
</style>