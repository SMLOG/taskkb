<script setup>
import FixTableTimeline from './components/FixTableTimeline.vue'
</script>

<template>
  <header>

    <div class="wrapper">
<!--       <MyCalendar  :currentDate='new Date("2023-11-01")'></MyCalendar>
      <MyCalendar  :currentDate='new Date("2023-12-01")'></MyCalendar>
      <MyCalendar  :currentDate='new Date("2024-01-01")'></MyCalendar> -->
	
    </div>
  </header>

  <main>
    <FixTableTimeline />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
