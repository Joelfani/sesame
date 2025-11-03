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
    type_compte:null, 
    avatar:null,
    sup:'',
    niv:null,
    achat:false,
    finance:false,
    dpr:false,
    cheque:false,
    livraison:false,
    fournisseur:false,
    add:'',
    edit:'',
    delet:'',
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
    this.type_compte = user.type_compte
    this.avatar = user.avatar
    this.sup = user.sup
    this.niv = user.niv
    this.achat = user.achat
    this.finance = user.finance
    this.dpr = user.dpr
    this.cheque = user.cheque
    this.livraison = user.livraison
    this.fournisseur = user.fournisseur
    this.add = user.add
    this.edit = user.edit
    this.delet = user.delet
    },
    updateUser(newData) {
    this.email = newData.email || this.email
    this.name_user = newData.name_user || this.name_user
    this.full_name = newData.full_name || this.full_name
    this.genre = newData.genre || this.genre
    this.resp = newData.resp || this.resp
    this.tel = newData.tel || this.tel
    this.type_compte = newData.type_compte || this.type_compte
    this.avatar = newData.avatar || this.avatar
    this.sup = newData.sup || this.sup
    this.niv = newData.niv || this.niv
    this.add = newData.add || this.add
    this.edit = newData.edit || this.edit
    this.delet = newData.delet || this.delet
    },
    clearUser() {
        this.$reset()
    }
}
})
