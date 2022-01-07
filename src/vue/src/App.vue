<template>
  <div>
    <h1 v-html="todoName" />
    <button class="add-task-button" @click="addnew">+</button>
    <div class="boards-container">
      <board
        ref="board"
        v-for="(_, index) in boardCount"
        :key="index"
        :board-index="index"
      />
    </div>
  </div>
</template>

<script>
import Board from "@/components/Board.vue";
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "App",
  components: {
    Board,
  },
  data() {
    return {
      unsubscribe: null,
    }
  },
  setup() {
    const store = useStore();

    return {
      todoName: computed(() => store.state.name),
      boardCount: computed(() => store.state.boards.length),
      addTicket: () => store.commit("addTicket", { boardIndex: 0, data: "" }),
      parseMarkdown: (markdown) =>
        store.dispatch("parseMarkdown", { markdown: markdown }),
      convertMarkdown: () => store.dispatch("convertMarkdown"),
      subscribe: (fn) => store.subscribe(fn)
    };
  },
  created() {
    // eslint-disable-next-line
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', (event) => {
      const message = event.data;

      switch(message.command) {
        case 'read':
          if(this.unsubscribe != null) {
            this.unsubscribe()
          }

          this.parseMarkdown(message.data);

          this.unsubscribe = this.subscribe(() => {
            this.convertMarkdown().then((markdown) => {
              vscode.postMessage({command: 'write', data: markdown});
            });
          });
          break;
      }
    });

  vscode.postMessage({command: 'created'})
  },
  methods: {
    addnew() {
      this.addTicket();
      this.$nextTick(() => {
        this.$refs.board[0].child(0).edit();
      });
    },
  },
};
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #abb2bf;
  margin-top: 60px;
}

* {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

textarea {
  color: #abb2bf;
}

html {
  background-color: #282c34;
}

button {
  cursor: pointer;
  color: #abb2bf;
  margin: 5px;
}
</style>

<style scoped>
.add-task-button {
  border: none;
  background: #4d77cc;
  color: #f8fafa;
  font-size: 16px;
  position: fixed;
  width: 40px;
  height: 40px;
  right: 20px;
  bottom: 20px;
  border-radius: 25px;
}

.boards-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
