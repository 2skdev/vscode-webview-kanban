<template>
  <div
    class="ticket-bg"
    :class="{ 'ticket-bg-focus': editing }"
    @mouseover="visible = true"
    @mouseleave="visible = false"
  >
    <div
      v-if="!editing"
      v-html="parsedHtml"
      class="ticket-show"
      :style="done ? 'text-decoration: line-through;' : ''"
      ref="show"
      @click="editing = true"
    />
    <textarea
      v-else
      v-model="text"
      ref="input"
      class="ticket-input"
      placeholder="New Task"
      @blur="editing = false"
      @keydown.prevent.enter="editing = false"
      @keydown.prevent.tab.exact="$emit('next')"
      @keydown.prevent.shift.tab.exact="$emit('prev')"
    />
    <button
      v-show="visible && !dragging"
      class="ticket-delete-button"
      @click="ondelete"
    >
      ×
    </button>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "Ticket",
  props: ["boardIndex", "ticketIndex", "dragging"],
  setup(props) {
    const store = useStore();

    return {
      content: computed(
        () => store.state.boards[props.boardIndex].tickets[props.ticketIndex]
      ),
      done: computed(() => store.state.boards[props.boardIndex].done),
      update: (data) =>
        store.commit("updateTicket", {
          boardIndex: props.boardIndex,
          ticketIndex: props.ticketIndex,
          data: data,
        }),
      remove: () =>
        store.commit("removeTicket", {
          boardIndex: props.boardIndex,
          ticketIndex: props.ticketIndex,
        }),
    };
  },
  data() {
    return {
      editing: false,
      visible: false,
      style: {},
    };
  },
  watch: {
    editing: function (value) {
      if (value == false) {
        if (this.text == "") {
          this.remove();
        } else {
          this.$refs.input.scrollTop = 0;
        }
      } else {
        const h = this.$refs.show.clientHeight;
        this.$nextTick(() => {
          this.$refs.input.focus();
          this.$refs.input.style.height = h + "px";
        });
      }
    },
  },
  computed: {
    text: {
      get() {
        return this.content;
      },
      set(value) {
        this.update(value);
      },
    },
    parsedHtml() {
      return this.content.replace("  ", "</br>");
    },
  },
  methods: {
    ondelete() {
      this.remove();
    },
    edit() {
      this.editing = true;
    },
  },
};
</script>

<style scoped>
.ticket-bg {
  background: #21252b;
  margin: 5px 0px;
  padding: 5px;
  position: relative;
  border-radius: 5px;
  border: 1px solid transparent;
}

.ticket-bg-focus {
  border-color: #4d77cc;
}

.ticket-show {
  word-break: break-all;
  text-align: left;
  cursor: default;
  min-height: 16px;
  font-size: 14px;
}

.ticket-input {
  display: block;
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  resize: none;
  overflow: hidden;
  padding: 0px;
  font-size: 14px;
}

.ticket-delete-button {
  background: #e06c75cc;
  border-radius: 2px;
  border: none;
  color: #f8fafa;

  position: absolute;
  top: 50%;
  right: 0px;
  height: 20px;
  width: 20px;
  transform: translateY(-50%) translateX(-50%);
  margin: 0px;
  padding: 0px;
}
</style>
