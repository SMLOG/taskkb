<template>
  <div class="config">
    <div>
      <span>Columns</span> <a @click="addCol()">+</a>
    </div>
    <div>
      <div v-for="(col, i) in cols" :key="i" style="display: flex;" @dragover="dragOver" @drop="drop($event, col, i)">
        <div style="width:46px;text-align: center;" :draggable="true" @dragstart="dragstart($event, col, i)">{{ i + 1 }}
        </div>
        <div style="width:100px"> <select v-model="col.cp">
            <option v-for="cp in cpList">{{ cp }}</option>
          </select> </div>
        <div> <input v-model="col.name" /></div>
        <div style="width:60px;margin-left: 10px;">Sticky <input type="checkbox" v-model="col.sticky" /></div>
        <div style="width:60px;margin-left: 10px;">Show <input type="checkbox" v-model="col.show" /></div>
        <div style="width:60px;margin-left: 10px;">Group <input type="checkbox" v-model="col.group" /></div>
        <div style="width:80px;margin-left: 10px;">Formula <input type="checkbox" v-model="col.group" /></div>
        <div><a @click="delCol(col, i)">Remove</a></div>
      </div>
    </div>

  </div>
</template>

<script setup>
</script>
<script>
export default {
  data() {
    return {
      cpList: ["ColTitle", "ColDropText", "Date", "Time"],
      // cols: localStorage.getItem('cols') ? JSON.parse(localStorage.getItem('cols')) : [],
      dragStartIndex: null
    }
  },

  props: {
    cols: {
      type: Object,
    }

  },
  methods: {
    dragstart(event, row, i) {
      this.dragStartIndex = i;
    },
    dragOver(event) {
      event.preventDefault();
    },
    drop(event, row, endIndex) {

      console.log(row);
      let startIndex = this.dragStartIndex;

      let startRow = this.cols.splice(startIndex, 1)[0];
      if (endIndex > startIndex) endIndex -= 1;

      let endRow = this.cols.splice(endIndex, 1, startRow)[0];
      this.cols.splice(startIndex, 0, endRow);




    }, findMissingNumber(list) {
      list.sort(function (a, b) {
        return a - b;
      });

      var missingNumber = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i] != missingNumber) {
          break;
        }
        missingNumber++;
      }

      return missingNumber;
    },
    calculateTextWidth(text) {

      var body = document.querySelector("body");
      var computedStyle = window.getComputedStyle(body);
      var font = computedStyle.fontSize + " " + computedStyle.fontFamily;

      var fontFamilies = font.split(",");

      var maxWidth = 0;
      for (var i = 0; i < fontFamilies.length; i++) {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        context.font = fontFamilies[i];

        var metrics = context.measureText(text);
        var width = metrics.width;

        console.log(fontFamilies[i], width);
        if (width > maxWidth) {
          maxWidth = width;
        }

        canvas = null;
      }

      return maxWidth;
    },
    addCol() {

      let nextcid = this.findMissingNumber(this.cols.map(e => e.fn).sort());
      let text = "New Column";
      let width = this.calculateTextWidth(text + "  ");
      this.cols.push({ field: {}, cp: 'ColDropText', width: width, name: text, fn: nextcid })
    },
    delCol(col, i) {
      this.cols.splice(i, 1);
    }

  },
};
</script>

<style></style>