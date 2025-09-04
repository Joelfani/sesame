// plugins/supabaseService.ts
import { useNuxtApp } from '#app'

export const useSupabaseTable = (tableName: string) => {
const { $supabase } = useNuxtApp()

return {
    getAll: async () => {
    const { data, error } = await $supabase.from(tableName).select('*')
    return { data, error }
    },

    insert: async (row: object) => {
    const { data, error } = await $supabase.from(tableName).insert([row])
    return { data, error }
    },

    update: async (row: object, match: object) => {
    const { data, error } = await $supabase.from(tableName).update(row).match(match)
    return { data, error }
    },

    delete: async (match: object) => {
    const { data, error } = await $supabase.from(tableName).delete().match(match)
    return { data, error }
    }
}
}
