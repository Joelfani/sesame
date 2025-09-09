import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
state: () => ({
    id: null, 
    email: '',
    name_user: '',
    full_name: '',
    genre: '',
    resp:'',
    tel:'',
}),
actions: {
    async setUser(user) {
    this.id = user.id
    this.email = user.email
    this.name_user = user.name_user
    this.full_name = user.full_name
    this.genre = user.genre
    this.resp = user.resp
    this.tel = user.tel
    },
    update_name(new_name) {
        this.name_user = new_name
    },

    update_email(new_email) {
        this.email = new_email
    },
    clearUser() {
        this.$reset()
    }
}
})
