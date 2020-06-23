let List = {
    template: `<div>
        <p>
          <input type="text" v-model.trim="input">
          <a href="aso:;" v-on:click="createHandler">{{ createMsg }}</a>
        </p>
        <ol>
          <li v-for="(item,index) in contents" :key="item.id">
            {{ item.content }}
            <a href="aso:;" v-on:click="updateHandler(index)">{{ updateMsg }}</a>
            <a href="aso:;" v-on:click="deleteHandler(index)">{{ deleteMsg }}</a>
          </li>
        </ol>
      </div>`,
    data: function () {
        return {
            createMsg: "新增",
            updateMsg: "更新",
            deleteMsg: "刪除",
            input: "",
        };
    },
    computed: {
        contents() {
            console.log(this.$store.state.contents);
            return this.$store.state.contents;
        },
    },
    methods: {
        createHandler() {
            if (!this.input) return false;
            axios
                .post("http://localhost:3000/contents", {
                    content: this.input,
                })
                .then((res) => {
                    this.input = ""; // 將資料清空
                    this.$store.commit("addContent", res.data); // 將資料塞入
                });
        },
        deleteHandler(index) {
            let target = this.contents[index]; // 先將要刪除哪一比資料列出
            axios.delete(`http://localhost:3000/contents/${target.id}`).then((res) => {
                this.contents.splice(index, 1);
            });
        },
        updateHandler(index) {
            let target = this.contents[index];
            this.$router.push({ path: `/update/${target.id}` }); // 路由依 id 挑選出頁面進行導頁
        },
    },
};
let Edit = {
    template: `<div>
        <p>
          <input type="text" v-model.trim="input">
          <a href="aso:;" v-on:click="updateHandler">{{ updateMsg }}</a>
        </p>
        </div>`,
    data() {
        return {
            updateMsg: "修改",
            input: "",
        };
    },
    computed: {
        content() {
            return this.$store.state.contents.find((item) => {
                return item.id == this.$route.params.id;
            });
        },
    },
    methods: {
        updateHandler() {
            this.$store
                .dispatch("CONTENT_UPDATE", {
                    id: this.content.id,
                    input: this.input,
                })
                .then(() => {
                    this.$router.push({ path: "/" }); // update 資料後將倒回首頁
                });
        },
    },
    mounted() {
        if (!this.content) return this.$router.replace({ path: "/" });
        this.input = this.content.content;
    },
};

let store = new Vuex.Store({
    strict: true,
    state: {
        contents: [],
    },
    mutations: {
        setContents(state, data) {
            state.contents = data;
        },
        addContent(state, data) {
            state.contents.push(data);
        },
        updateContent(state, { item, input }) {
            item.content = input;
        },
    },
    actions: {
        CONTENTS_READ: (context) => {
            return axios.get("http://localhost:3000/contents").then((res) => {
                context.commit("setContents", res.data); // 將顯示所有的資料
            });
        },
        CONTENT_UPDATE: (context, { id, input }) => {
            let item = context.state.contents.find((item) => {
                return item.id == id;
            });
            if (!item) return false;
            return axios.patch("http://localhost:3000/contents/" + item.id, { content: input }).then((res) => {
                context.commit("updateContent", { item, input }); // commit 修改資料
            });
        },
    },
});

let router = new VueRouter({
    routes: [
        {
            path: "/",
            name: "list",
            component: List,
        },
        {
            path: "/update/:id",
            name: "update",
            component: Edit,
        },
        {
            path: "*",
            redirect: "/",
        },
    ],
});

new Vue({
    el: "#app",
    router,
    store,
    mounted() {
        this.$store.dispatch("CONTENTS_READ");
    },
});
