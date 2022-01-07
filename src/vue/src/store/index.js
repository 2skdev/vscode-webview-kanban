import { createStore } from 'vuex'
import { marked } from "marked"

export const store = createStore({
  state() {
    return {
      name: "TODO",
      boards: [
      ]
    }
  },
  mutations: {
    setName(state, { name }) {
      state.name = name
    },
    addTicket(state, { boardIndex, data }) {
      state.boards[boardIndex].tickets.unshift(data)
    },
    removeTicket(state, { boardIndex, ticketIndex }) {
      state.boards[boardIndex].tickets.splice(ticketIndex, 1)
    },
    clearTicket(state, { boardIndex }) {
      state.boards[boardIndex].tickets = []
    },
    updateTicket(state, { boardIndex, ticketIndex, data }) {
      state.boards[boardIndex].tickets[ticketIndex] = data
    },
    setBoard(state, { boardIndex, data }) {
      state.boards[boardIndex].tickets = data
    },
    addBoard(state, { title, done }) {
      state.boards.push({
        title: title,
        done: done,
        tickets: [],
      })
    },
    clearBoards(state) {
      state.boards = []
    },
  },
  actions: {
    parseMarkdown(context, { markdown }) {
      context.commit("clearBoards")

      const parser = new DOMParser()
      const dom = parser.parseFromString(marked(markdown), 'text/html')

      context.commit("setName", { name: dom.querySelector("h1").innerHTML })

      dom.querySelectorAll("h2").forEach((h2) => {
        let title = h2.innerHTML
        const match = title.match(/\[x\]\s*(.*)/)

        if (match != null) {
          title = match[1]
        }
        context.commit("addBoard", { title: title, done: match != null })

        const ul = h2.nextElementSibling
        if (ul != null && ul.tagName == 'UL') {
          ul.children.forEach((li) => {
            li.querySelector("input").remove()
            context.commit("addTicket", { boardIndex: context.state.boards.length - 1, data: li.innerHTML.trim() })
          })
        }
      })

      context.dispatch("convertMarkdown")
    },
    convertMarkdown(context) {
      let markdown = []

      markdown.push(`# ${context.state.name}`)
      markdown.push("")

      context.state.boards.forEach((board) => {
        markdown.push(`## ${board.done ? '[x] ' : ''}${board.title}`)

        board.tickets.forEach((ticket) => {
          markdown.push(`- [${board.done ? 'x' : ' '}] ${ticket}`)
        })

        markdown.push("")
      })

      return markdown.join('\n')
    }
  }
})
