// composables/useSesameNotifications.js
//
// Notifications SESAME — tous les flows :
//   - achat   -> ses_histo   (obj: ses_demandeobj / items: ses_demItems)
//   - drfms   -> ses_histo2, cat_proc = 'drfms'  (niveau sur ses_obj)
//   - ndf     -> ses_histo2, cat_proc = 'ndf'    (niveau sur ses_items_ndf)
//   - odm     -> ses_histo2, cat_proc = 'odm'    (niveau sur ses_obj)
//   - bourse  -> ses_histo2, cat_proc = 'bourse' (niveau sur ses_items_bourse)
//
// Solo (demandeur) : type IN (retour, rejeter, edit, fin)
//   - retour : gardé uniquement si niv_val histo === erg ET l'item/l'objet
//     est ENCORE à erg aujourd'hui (sinon la demande a déjà avancé, la notif
//     est obsolète)
//   - rejeter / edit / fin : toujours gardés, pas de filtre de niveau
//
// ⚠️ POINT IMPORTANT (celui qui nous a posé problème) :
// ses_histo2.id_item n'a PAS de relation FK exploitable vers une table
// unique, car selon cat_proc il désigne une ligne de ses_items_ndf, de
// ses_items_bourse ou (pour l'achat) de ses_demItems. Impossible donc de
// filtrer le "niveau actuel de l'item" directement dans la requête SQL via
// un embed Supabase (id_item!inner(...)) : Postgres/PostgREST ne sait pas
// vers quelle table résoudre la relation.
// -> Solution : on récupère TOUTES les notifs du niveau demandé depuis
//    ses_histo/ses_histo2 (comme avant), PUIS on va chercher, dans la
//    table d'items propre au flow (flow.itemsRelation), le niveau ACTUEL
//    de chaque id_item concerné, et on filtre en JS (filterByCurrentLevel).
//    Un peu plus de requêtes réseau, mais ça ne dépend d'aucune contrainte
//    FK et ça marche quelle que soit la table réelle derrière id_item.

import { ref, computed, watch } from 'vue'
import {
  niveau,
  niveauDRFMS,
  niveauNDF,
  niveauODM,
  niveauBourse,
} from '~/assets/js/CommonVariable'

const SOLO_TYPES = ['retour', 'rejeter', 'edit', 'fin']

// --------------------------------------------------------------------------
// 1. CONFIG PAR FLOW
// --------------------------------------------------------------------------
const FLOWS = {
  achat: {
    key: 'achat',
    label: 'Achat',
    badgeColor: '#0d6efd',
    table: 'ses_histo',
    catProc: null,
    niveau,
    levelSource: 'items',
    itemsRelation: 'ses_demItems',
    supLevel: niveau.superieur,
    soloColumn: 'stat_not_sol',
    queueColumn: 'stat_not',
    routeFor(role, id) {
      const map = {
        achat: `/achat/${id}`,
        cg: `/controlleur/${id}`,
        finance: `/finance/${id}`,
        dpr: `/dpr/${id}`,
        afe: `/AFE/${id}`,
        cheque: `/cheque/${id}`,
        livraison: `/livraison/${id}`,
      }
      return map[role] ?? null
    },
    routeForSup: (id) => `/validation/${id}`,
    routeForSolo: (id) => `/demande/${id}`,
  },

  drfms: {
    key: 'drfms',
    label: 'DRFMS',
    badgeColor: '#6f42c1',
    table: 'ses_histo2',
    catProc: 'drfms',
    niveau: niveauDRFMS,
    levelSource: 'object', // niveau géré directement sur ses_obj
    itemsRelation: null,
    supLevel: null, // pas de palier "superieur" pour le DRFMS
    soloColumn: 'stat_not_sol',
    queueColumn: 'stat_not',
    routeFor(role, id) {
      const map = {
        dpr: `/dpr/drfms/${id}`,
        rh: `/rh/${id}`,
        finance: `/finance/drfms/${id}`,
        cg: `/controlleur/drfms/${id}`,
        cheque: `/cheque/drfms/${id}`,
      }
      return map[role] ?? `/${role}/drfms/${id}`
    },
    routeForSup: (id) => `/validation/drfms/${id}`,
    routeForSolo: (id) => `/demande/drfms/${id}`,
  },

  ndf: {
    key: 'ndf',
    label: 'NDF',
    badgeColor: '#fd7e14',
    table: 'ses_histo2',
    catProc: 'ndf',
    niveau: niveauNDF,
    levelSource: 'items',
    itemsRelation: 'ses_items_ndf',
    supLevel: niveauNDF.superieur,
    soloColumn: 'stat_not_sol',
    queueColumn: 'stat_not',
    routeFor(role, id) {
      const map = {
        finance: `/finance/ndf/${id}`,
        cg: `/controlleur/ndf/${id}`,
        dpr: `/dpr/ndf/${id}`,
        cheque: `/cheque/ndf/${id}`,
      }
      return map[role] ?? `/${role}/ndf/${id}`
    },
    routeForSup: (id) => `/validation/ndf/${id}`,
    routeForSolo: (id) => `/demande/ndf/${id}`,
  },

  odm: {
    key: 'odm',
    label: 'ODM',
    badgeColor: '#20c997',
    table: 'ses_histo2',
    catProc: 'odm',
    niveau: niveauODM,
    levelSource: 'object',
    itemsRelation: null,
    supLevel: niveauODM.superieur,
    soloColumn: 'stat_not_sol',
    queueColumn: 'stat_not',
    routeFor(role, id) {
      const map = {
        rh: `/rh/odm/${id}`,
        finance: `/finance/odm/${id}`,
        cg: `/controlleur/odm/${id}`,
        dpr: `/dpr/odm/${id}`,
        cheque: `/cheque/odm/${id}`,
      }
      return map[role] ?? `/${role}/odm/${id}`
    },
    routeForSup: (id) => `/validation/odm/${id}`,
    routeForSolo: (id) => `/demande/odm/${id}`,
  },

  bourse: {
    key: 'bourse',
    label: 'Bourse étudiant',
    badgeColor: '#d63384',
    table: 'ses_histo2',
    catProc: 'bourse',
    niveau: niveauBourse,
    levelSource: 'items',
    itemsRelation: 'ses_items_bourse',
    supLevel: niveauBourse.superieur,
    soloColumn: 'stat_not_sol',
    queueColumn: 'stat_not',
    routeFor(role, id) {
      const map = {
        finance: `/finance/bourse/${id}`,
        cg: `/controlleur/bourse/${id}`,
        dpr: `/dpr/bourse/${id}`,
        cheque: `/cheque/bourse/${id}`,
      }
      return map[role] ?? `/${role}/bourse/${id}`
    },
    routeForSup: (id) => `/validation/bourse/${id}`,
    routeForSolo: (id) => `/demande/bourse/${id}`,
  },
}

const ROLE_LABELS = {
  achat: "de l'achat",
  cg: 'du contrôle de gestion',
  finance: 'de la finance',
  dpr: 'du DPR',
  afe: "de l'AFE-BC",
  cheque: 'du chèque',
  livraison: 'de la livraison',
  rh: 'des ressources humaines',
}

const NON_QUEUE_LEVEL_KEYS = ['erg', 'superieur', 'valide', 'refuse']

function getQueueRoles(flowConfig) {
  return Object.entries(flowConfig.niveau)
    .filter(([key]) => !NON_QUEUE_LEVEL_KEYS.includes(key))
    .map(([key, value]) => ({ role: key, niv: value }))
}

function dedupById(rows) {
  const seen = new Set()
  return (rows || []).filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

// --------------------------------------------------------------------------
// 2. VÉRIFICATION DU NIVEAU ACTUEL (post-fetch, en JS)
// --------------------------------------------------------------------------

// Va chercher, dans la table d'items PROPRE au flow (flow.itemsRelation),
// le niveau actuel de chaque id_item demandé. Une seule requête groupée
// (.in('id', ...)) plutôt qu'une requête par notification.
async function fetchItemLevels(supabase, flow, itemIds) {
  const uniqueIds = [...new Set(itemIds.filter((id) => id != null))]
  if (!uniqueIds.length) return new Map()

  const { data, error } = await supabase
    .from(flow.itemsRelation) // ex: ses_items_ndf, ses_items_bourse, ses_demItems
    .select('id, niv_val')
    .in('id', uniqueIds)
  if (error) throw error

  return new Map(data.map((it) => [it.id, it.niv_val]))
}

// Filtre une liste de notifications pour ne garder que celles dont le
// niveau ACTUEL (pas celui enregistré dans l'historique, qui peut être
// périmé) correspond bien à `niv`.
async function filterByCurrentLevel(supabase, flow, rows, niv) {
  if (!rows.length) return rows

  if (flow.levelSource === 'object') {
    // Pas d'ambiguïté de table ici : id_obj pointe toujours vers ses_obj
    // (ou ses_demandeobj pour l'achat), le niveau est déjà dans l'embed.
    return rows.filter((n) => Number(n.id_obj?.niv_val) === Number(niv))
  }

  // levelSource === 'items' : on résout via une requête séparée sur la
  // vraie table d'items du flow (voir commentaire en tête de fichier).
  const levels = await fetchItemLevels(supabase, flow, rows.map((n) => n.id_item))
  return rows.filter((n) => Number(levels.get(n.id_item)) === Number(niv))
}

// Solo "retour" : on ne garde que si l'item/l'objet est ENCORE à erg
// aujourd'hui (sinon la demande a déjà avancé, la notif est obsolète).
// Les autres types (rejeter, edit, fin) sont gardés sans vérification de
// niveau (ce sont des états terminaux, pas de "niveau courant" à comparer).
async function filterSoloNotifications(supabase, flow, rows) {
  const erg = Number(flow.niveau.erg)
  const kept = rows.filter((n) => n.type !== 'retour')
  const retoursAtErg = rows.filter(
    (n) => n.type === 'retour' && Number(n.niv_val) === erg
  )
  if (!retoursAtErg.length) return kept

  const stillAtErg = await filterByCurrentLevel(supabase, flow, retoursAtErg, erg)
  return [...kept, ...stillAtErg]
}

// --------------------------------------------------------------------------
// 3. SELECT SUPABASE (simplifié : plus d'embed sur les items)
// --------------------------------------------------------------------------
function buildSelect(flow) {
  if (flow.levelSource === 'object') {
    return `*, id_obj!inner(*, id_user, id_sup, niv_val)`
  }
  // levelSource === 'items' : id_item reste une simple colonne de
  // ses_histo/ses_histo2 (déjà incluse via "*"), résolue à part par
  // fetchItemLevels() plutôt que par un embed Supabase.
  return `*, id_obj!inner(*, id_user, id_sup)`
}

// --------------------------------------------------------------------------
// 4. COMPOSABLE PRINCIPAL
// --------------------------------------------------------------------------
export function useSesameNotifications() {
  const supabase = useSupabaseClient()
  const router = useRouter()
  const userStore = useUserStore()
  const realtimeStore = useSubscribeStore()

  const isLoading = ref(false)
  const solos = ref([])
  const sups = ref([])
  const others = ref([])
  const activeFlowFilter = ref(null)

  const filteredSolos = computed(() =>
    activeFlowFilter.value
      ? solos.value.filter((n) => n._flow === activeFlowFilter.value)
      : solos.value
  )
  const filteredSups = computed(() =>
    activeFlowFilter.value
      ? sups.value.filter((n) => n._flow === activeFlowFilter.value)
      : sups.value
  )
  const filteredOthers = computed(() =>
    activeFlowFilter.value
      ? others.value.filter((n) => n._flow === activeFlowFilter.value)
      : others.value
  )

  const totalNotificationsAll = computed(
    () => solos.value.length + sups.value.length + others.value.length
  )

  const totalNotifications = computed(
    () =>
      filteredSolos.value.length +
      filteredSups.value.length +
      filteredOthers.value.length
  )

  const countByFlow = computed(() => {
    const all = [...solos.value, ...sups.value, ...others.value]
    const counts = {}
    for (const key of Object.keys(FLOWS)) counts[key] = 0
    for (const n of all) counts[n._flow] = (counts[n._flow] || 0) + 1
    return counts
  })

  // ------------------------------------------------------------------
  // SOLO
  // ------------------------------------------------------------------
  async function fetchSolo(flow) {
    let query = supabase
      .from(flow.table)
      .select(buildSelect(flow))
      .eq('id_obj.id_user', userStore.id)
      .eq(flow.soloColumn, false)
      .in('type', SOLO_TYPES)
      .order('id', { ascending: false })

    if (flow.catProc) query = query.eq('cat_proc', flow.catProc)

    const { data, error } = await query
    if (error) throw error

    const deduped = dedupById(data).map((n) => ({ ...n, _flow: flow.key }))
    return filterSoloNotifications(supabase, flow, deduped)
  }

  // ------------------------------------------------------------------
  // SUP (palier "superieur", via id_sup) — absent pour certains flows
  // (ex: DRFMS) : fetchSup renvoie [] dans ce cas.
  // ------------------------------------------------------------------
  async function fetchSup(flow) {
    if (flow.supLevel === null || flow.supLevel === undefined) return []

    let query = supabase
      .from(flow.table)
      .select(buildSelect(flow))
      .eq('id_obj.id_sup', userStore.id)
      .eq(flow.queueColumn, false)
      .eq('niv_val', flow.supLevel)
      .order('id', { ascending: false })

    if (flow.catProc) query = query.eq('cat_proc', flow.catProc)

    const { data, error } = await query
    if (error) throw error

    const deduped = dedupById(data).map((n) => ({ ...n, _flow: flow.key }))
    // Vérifie que l'item/l'objet est encore RÉELLEMENT à ce niveau
    // aujourd'hui (et pas juste au moment de l'événement historique).
    return filterByCurrentLevel(supabase, flow, deduped, flow.supLevel)
  }

  // ------------------------------------------------------------------
  // OTHERS ("système") : une requête par rôle métier possédé par
  // l'utilisateur, en parallèle. On récupère TOUT ce qui est au niveau
  // `niv` dans l'historique, puis on filtre en JS sur le niveau ACTUEL
  // (c'est ce filtrage après-coup qui règle le bug des notifs NDF/bourse
  // qui restaient affichées après validation d'une seule ligne).
  // ------------------------------------------------------------------
  async function fetchOthers(flow) {
    const queueRoles = getQueueRoles(flow).filter(
      ({ role }) => userStore[role] === true
    )
    if (queueRoles.length === 0) return []

    const requests = queueRoles.map(async ({ role, niv }) => {
      let query = supabase
        .from(flow.table)
        .select(buildSelect(flow))
        .eq(flow.queueColumn, false)
        .eq('niv_val', niv)
        .order('id', { ascending: false })

      if (flow.catProc) query = query.eq('cat_proc', flow.catProc)

      const { data, error } = await query
      if (error) throw error

      const deduped = dedupById(data).map((n) => ({
        ...n,
        _flow: flow.key,
        _role: role,
      }))

      return filterByCurrentLevel(supabase, flow, deduped, niv)
    })

    const results = await Promise.all(requests)
    return results.flat()
  }

  // ------------------------------------------------------------------
  // FETCH ALL — récupère tout, tous flows confondus, en parallèle. Un
  // échec sur un flow n'empêche pas les autres de remonter leurs notifs.
  // ------------------------------------------------------------------
  async function fetchAll() {
    isLoading.value = true
    try {
      const flowList = Object.values(FLOWS)
      const soloResults = []
      const supResults = []
      const otherResults = []

      await Promise.all(
        flowList.map(async (flow) => {
          try {
            const [s, u, o] = await Promise.all([
              fetchSolo(flow),
              fetchSup(flow),
              fetchOthers(flow),
            ])
            soloResults.push(s)
            supResults.push(u)
            otherResults.push(o)
          } catch (e) {
            console.error(`[notif ${flow.key}] échec:`, e)
            soloResults.push([])
            supResults.push([])
            otherResults.push([])
          }
        })
      )

      solos.value = soloResults.flat()
      sups.value = supResults.flat()
      others.value = otherResults.flat()
    } catch (error) {
      console.error('Erreur récupération notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  // ------------------------------------------------------------------
  // MARK AS READ
  // ------------------------------------------------------------------
  async function markAsRead(category, notif) {
    const flow = FLOWS[notif._flow]
    if (!flow) return
    const column = category === 'solo' ? flow.soloColumn : flow.queueColumn

    try {
      const { error } = await supabase
        .from(flow.table)
        .update({ [column]: true })
        .eq('id', notif.id)
      if (error) throw error

      if (category === 'solo') {
        solos.value = solos.value.filter(
          (n) => !(n.id === notif.id && n._flow === notif._flow)
        )
      } else if (category === 'sup') {
        sups.value = sups.value.filter(
          (n) => !(n.id === notif.id && n._flow === notif._flow)
        )
      } else {
        others.value = others.value.filter(
          (n) => !(n.id === notif.id && n._flow === notif._flow)
        )
      }
    } catch (error) {
      console.error('Erreur markAsRead:', error)
    }
  }

  // Regroupe les updates par (table, colonne) pour limiter le nombre de
  // requêtes, même si les notifs affichées viennent de 5 flows répartis
  // sur seulement 2 tables physiques (ses_histo / ses_histo2).
  async function markAllAsRead() {
    const groups = new Map()

    function addToGroup(notif, column) {
      const flow = FLOWS[notif._flow]
      if (!flow) return
      const key = `${flow.table}::${column}`
      if (!groups.has(key)) {
        groups.set(key, { table: flow.table, column, ids: [] })
      }
      groups.get(key).ids.push(notif.id)
    }

    solos.value.forEach((n) => addToGroup(n, FLOWS[n._flow].soloColumn))
    sups.value.forEach((n) => addToGroup(n, FLOWS[n._flow].queueColumn))
    others.value.forEach((n) => addToGroup(n, FLOWS[n._flow].queueColumn))

    // Vidage optimiste, avec sauvegarde pour rollback si l'update échoue
    const prev = {
      solos: [...solos.value],
      sups: [...sups.value],
      others: [...others.value],
    }
    solos.value = []
    sups.value = []
    others.value = []

    try {
      const results = await Promise.all(
        [...groups.values()].map(({ table, column, ids }) => {
          if (!ids.length) return { error: null }
          return supabase.from(table).update({ [column]: true }).in('id', ids)
        })
      )
      results.forEach((r) => {
        if (r?.error) throw r.error
      })
    } catch (error) {
      console.error('Erreur markAllAsRead:', error)
      // Échec : on restaure l'état local plutôt que de laisser l'utilisateur
      // croire que tout est lu alors que l'update serveur a échoué.
      solos.value = prev.solos
      sups.value = prev.sups
      others.value = prev.others
    }
  }

  // ------------------------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------------------------
  function goTo(category, notif) {
    const flow = FLOWS[notif._flow]
    const requestId = notif.id_obj?.id
    if (!flow || !requestId) {
      console.warn('Notification sans route', notif)
      return
    }

    let path = null
    if (category === 'solo') path = flow.routeForSolo(requestId)
    else if (category === 'sup') path = flow.routeForSup(requestId)
    else path = flow.routeFor(notif._role, requestId)

    if (path) router.push(path)
    else console.warn('Route introuvable pour', notif)

    markAsRead(category, notif)
  }

  function getNotificationLabel(notif) {
    const flow = FLOWS[notif._flow]
    const roleLabel = ROLE_LABELS[notif._role] ?? notif._role
    return `[${flow?.label || notif._flow}] En attente de validation au niveau ${roleLabel}`
  }

  // ------------------------------------------------------------------
  // REALTIME : on réécoute les tables d'items propres à chaque flow (+
  // ses_obj pour drfms/odm, + ses_histo/ses_histo2 pour tout changement
  // d'historique) et on relance fetchAll() à chaque changement.
  // ------------------------------------------------------------------
  const watchedTables = [
    { table: 'ses_demItems' },
    { table: 'ses_items_ndf' },
    { table: 'ses_items_bourse' },
    { table: 'ses_obj' },
    { table: 'ses_histo' },
    { table: 'ses_histo2' },
  ]
  const watchedRefs = watchedTables.map(() => ref([]))

  function subscribeRealtime() {
    watchedTables.forEach(({ table }, i) => {
      if (realtimeStore && typeof realtimeStore.subscribeToTable === 'function') {
        realtimeStore.subscribeToTable(
          table,
          `notif_${table}`,
          watchedRefs[i],
          'id',
          'asc'
        )
        watch(watchedRefs[i], () => fetchAll(), { deep: true })
      } else {
        console.error('Store realtime non disponible pour', table)
      }
    })
  }

  function unsubscribeRealtime() {
    watchedTables.forEach(({ table }) => {
      if (
        realtimeStore &&
        typeof realtimeStore.unsubscribeFromTable === 'function'
      ) {
        realtimeStore.unsubscribeFromTable(table, `notif_${table}`)
      }
    })
  }

  return {
    isLoading,
    solos,
    sups,
    others,
    totalNotificationsAll,
    totalNotifications,
    countByFlow,
    activeFlowFilter,
    filteredSolos,
    filteredSups,
    filteredOthers,
    flows: FLOWS,
    fetchAll,
    markAsRead,
    markAllAsRead,
    goTo,
    getNotificationLabel,
    subscribeRealtime,
    unsubscribeRealtime,
  }
}