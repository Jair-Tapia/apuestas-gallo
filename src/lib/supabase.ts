import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iozolwqvlebjpvsuopfx.supabase.co'
const supabaseKey = 'sb_publishable_eCYXPLEMMjbkUBoIcNoV4w_2XGxPoEj'

export const supabase = createClient(supabaseUrl, supabaseKey)