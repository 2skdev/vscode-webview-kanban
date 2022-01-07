<template>
  <div class="board">
    <h2 class="board-title" v-html="title" />
    <draggable
      v-model="dictTickets"
      group="board"
      item-key="index"
      animation="300"
      @start="dragging = true"
      @end="dragging = false"
      handle=".ticket-show"
    >
      <template #item="{ element }">
        <ticket
          :ref="'ticket_' + element.index"
          :boardIndex="boardIndex"
          :ticketIndex="element.index"
          :dragging="dragging"
          @next="next(element.index)"
          @prev="prev(element.index)"
        />
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import Ticket from "@/components/Ticket.vue";

import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Board",
  components: {
    draggable,
    Ticket,
  },
  props: ["boardIndex"],
  setup(props) {
    const store = useStore();

    return {
      tickets: computed(() => store.state.boards[props.boardIndex].tickets),
      title: computed(() => store.state.boards[props.boardIndex].title),
      setBoard: (board) =>
        store.commit("setBoard", { boardIndex: props.boardIndex, data: board }),
    };
  },
  data() {
    return {
      dragging: false,
    };
  },
  computed: {
    dictTickets: {
      get() {
        return this.tickets.map((value, index) => {
          return { index: index, value: value };
        });
      },
      set(value) {
        this.setBoard(
          value.map((item) => {
            return item.value;
          })
        );
      },
    },
  },
  methods: {
    child(index) {
      return this.$refs["ticket_" + index];
    },
    next(index) {
      if (index < this.tickets.length - 1) {
        this.child(index + 1).edit();
      }
    },
    prev(index) {
      if (index > 0) {
        this.child(index - 1).edit();
      }
    },
  },
};
</script>

<style scoped>
.board {
  width: 240px;
  padding: 0px 10px 10px 10px;
  margin: 5px;
  vertical-align: top;
  background: rgba(255, 255, 255, 5%);
}

.board-title {
  font-size: 18px;
  font-weight: normal;
}

.sortable-ghost {
  background: rgba(255, 255, 255, 10%) !important;
}
</style>

<style>
.sortable-ghost * {
  visibility: hidden;
}
</style>
