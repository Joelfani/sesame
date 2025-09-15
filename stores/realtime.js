    // stores/realtime.js
    import { defineStore } from 'pinia'
    // Assure-toi de bien l'importer

    export const useSubscribeStore = defineStore('realtime', {
    state: () => ({
        subscriptions: {}, // Stocker les souscriptions par table
    }),

    actions: {
        subscribeToTable(tableName, var_data, storeContext, key_order = 'id', order = 'desc') {
        const supabase = useSupabaseClient()
        const channelName = `public:${tableName}:${var_data}`

        // ✅ Ne rien faire si déjà souscrit
        if (this.subscriptions[channelName]) {
            console.log(`Déjà souscrit à ${channelName}`)
            return
        }

        console.log(`Souscription à ${channelName}`)

        const subscription = supabase
            .channel(channelName)
            .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: tableName },
            (payload) => {
                console.log('Realtime event received:', payload.eventType, payload)

                // Vérifier que storeContext est bien un ref ou reactive contenant un array
                const list = storeContext.value ?? storeContext
                if (!Array.isArray(list[var_data] ?? list)) {
                console.error('Store data is not an array:', list[var_data] ?? list)
                return
                }

                // Accès à l'array réelle
                const targetList = list[var_data] ?? list

                if (payload.eventType === 'INSERT') {
                const updatedList = order === 'desc'
                    ? [payload.new, ...targetList].sort((a, b) => b[key_order] - a[key_order])
                    : [payload.new, ...targetList].sort((a, b) => a[key_order] - b[key_order])
                if (list[var_data]) list[var_data] = updatedList
                else storeContext.value = updatedList

                } else if (payload.eventType === 'UPDATE') {
                const index = targetList.findIndex(item => item.id === payload.new.id)
                if (index !== -1) {
                    targetList[index] = payload.new
                    const sorted = order === 'desc'
                    ? [...targetList].sort((a, b) => b[key_order] - a[key_order])
                    : [...targetList].sort((a, b) => a[key_order] - b[key_order])
                    if (list[var_data]) list[var_data] = sorted
                    else storeContext.value = sorted
                }

                } else if (payload.eventType === 'DELETE') {
                const filteredList = targetList.filter(item => item.id !== payload.old.id)
                if (list[var_data]) list[var_data] = filteredList
                else storeContext.value = filteredList
                }
            }
            )
            .subscribe((status, error) => {
            console.log(`Subscription status for ${channelName}:`, status)
            if (error) console.error(`Subscription error for ${channelName}:`, error)
            })

        this.subscriptions[channelName] = subscription
        },

        unsubscribeFromTable(tableName, var_data) {
        const supabase = useSupabaseClient()
        const channelName = `public:${tableName}:${var_data}`

        if (this.subscriptions[channelName]) {
            supabase.removeChannel(this.subscriptions[channelName])
            delete this.subscriptions[channelName]
            console.log(`Désabonnement de ${channelName}`)
        }
        },

        unsubscribeAll() {
        const supabase = useSupabaseClient()
        Object.entries(this.subscriptions).forEach(([channelName, subscription]) => {
            supabase.removeChannel(subscription)
            console.log(`Désabonnement de ${channelName}`)
        })
        this.subscriptions = {}
        }
    }
    })
