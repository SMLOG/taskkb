<template>
<EmojiPicker :native="true" @select="onSelectEmoji" />
</template>

<script setup>
import EmojiPicker from 'vue3-emoji-picker'

import 'vue3-emoji-picker/css'


const emits= defineEmits(["confirm","cancel"]);

const onSelectEmoji=(emoji) => {
  emits("confirm", emoji);
};

</script>