<script setup>
import Operation from './components/Operation.vue'
</script>

<template>
  <header>

    <div class="wrapper">
      <div>
        <router-link to="/excel">Table</router-link>
        <router-link to="/">Grid</router-link>
        <router-link to="/timeline">Time</router-link>
        <a>Grid</a><a>List</a><a>Card</a>
      </div>
    </div>
  </header>

  <main style="position: relative;
    flex-grow: 1;">
      <router-view >
      </router-view>
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
