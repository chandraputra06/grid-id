// Ambil access token utk testing: node scripts/token.js <email> <password>
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const [email, password] = process.argv.slice(2);
if (!email || !password) { console.error('Usage: node scripts/token.js <email> <password>'); process.exit(1); }
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
sb.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
  if (error) { console.error(error.message); process.exit(1); }
  process.stdout.write(data.session.access_token);
});