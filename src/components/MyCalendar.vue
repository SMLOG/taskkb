<template>
  <div class="calendar">
    <h2>{{ currentMonth }}</h2>
    <table>
      <thead>
        <tr>
          <th v-for="day in daysOfWeek" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in calendar" :key="week">
          <td v-for="day in week" :key="day" @click="selectDate(day)">
            {{ day }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      selectedDate: null
    };
  },
  props:{
    currentDate:new Date(),
  },
  computed: {
    currentMonth() {
      return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    calendar() {
      const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
      const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
      const calendar = [];

      let dayCounter = 1;
      let week = [];

      for (let i = 0; i < firstDay; i++) {
        week.push('');
      }

      while (dayCounter <= daysInMonth) {
        if (week.length === 7) {
          calendar.push([...week]);
          week = [];
        }

        week.push(dayCounter);
        dayCounter++;
      }

      if (week.length > 0) {
        while (week.length < 7) {
          week.push('');
        }
        calendar.push([...week]);
      }

      return calendar;
    }
  },
  methods: {
    selectDate(day) {
      this.selectedDate = day;
    }
  }
};
</script>

<style scoped>
.calendar {
  margin: 20px auto;
  text-align: center;
}

h2 {
  margin-bottom: 10px;
}

table {
  margin: 0 auto;
  border-collapse: collapse;
}

th,
td {
  padding: 5px;
  border: 1px solid #ccc;
  cursor: pointer;
}

td:hover {
  background-color: #eee;
}

td.selected {
  background-color: lightblue;
}
</style>