/* Static HTML — no build-time env vars. Hosting must inject HALA_RUNTIME_CONFIG
   before this file loads (via _runtime-config.js locally, or edge middleware in prod). */
const _rc = window.HALA_RUNTIME_CONFIG || {};
if (!_rc.VITE_SUPABASE_URL || !_rc.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[هلا] لم يتم العثور على إعدادات Supabase.\n' +
    'تأكد من وجود ملف _runtime-config.js قبل config.js، أو تهيئة متغيرات البيئة في منصة الاستضافة.'
  );
}
window.HALA_CONFIG = Object.freeze({
  supabaseUrl:      _rc.VITE_SUPABASE_URL      || '',
  supabaseAnonKey:  _rc.VITE_SUPABASE_ANON_KEY || '',
  assistantPath:    '/functions/v1/pilgrim-assistant'
});