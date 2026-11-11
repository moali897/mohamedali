// Fallback data — the live site reads the same rows from the Supabase `projects` table.
// To add a video: put files in public/media/{videos,loops,posters}/<slug>.* and add a row in Supabase.
const m = (slug) => ({
  video_url: `/media/hls/${slug}/master.m3u8`,
  loop_url: `/media/loops/${slug}.mp4`,
  poster_url: `/media/posters/${slug}.jpg`,
});

const AGRI = { category: 'agri', category_ar: 'زراعة', category_en: 'Agriculture' };
const HEALTH = { category: 'health', category_ar: 'رعاية صحية', category_en: 'Healthcare' };
const VET = { category: 'health', category_ar: 'بيطري ودواجن', category_en: 'Veterinary' };
const BRAND = { category: 'brand', category_ar: 'منتجات', category_en: 'Products' };
const DRAMA = { category: 'brand', category_ar: 'دراما توعوية', category_en: 'Awareness drama' };

export const FALLBACK_PROJECTS = [
  { slug: 'health-authority', title_ar: 'الهيئة العامة للرعاية الصحية', title_en: 'Egypt Healthcare Authority', ...HEALTH, aspect: '16:9', duration: '2:10' },
  { slug: 'olfa', title_ar: 'ألفة', title_en: 'Olfa', ...DRAMA, aspect: '9:16', duration: '1:02' },
  { slug: 'haj-sobhy', title_ar: 'شركة الفلاح', title_en: 'El Falah Company', ...AGRI, aspect: '9:16', duration: '1:20' },
  { slug: 'agri-company', title_ar: 'الشركة الزراعية — القمح الروسي', title_en: 'Russian Wheat Campaign', ...AGRI, aspect: '16:9', duration: '1:15' },
  { slug: 'russian-wheat-3', title_ar: 'القمح الروسي — الحقل', title_en: 'Russian Wheat — The Field', ...AGRI, aspect: '16:9', duration: '1:05' },
  { slug: 'national-co', title_ar: 'الشركة الوطنية', title_en: 'National Company', ...VET, aspect: '9:16', duration: '0:46' },
  { slug: 'doctor', title_ar: 'فيديو الدكتور — توعية السكر', title_en: 'Diabetes Awareness', ...HEALTH, aspect: '16:9', duration: '1:16' },
  { slug: 'rice', title_ar: 'منتج الأرز', title_en: 'Rice Product', ...AGRI, aspect: '9:16', duration: '1:12' },
  { slug: 'wheat-3', title_ar: 'القمح — لكل أنواع الأراضي', title_en: 'Wheat for Every Soil', ...AGRI, aspect: '16:9', duration: '0:56' },
  { slug: 'beans', title_ar: 'برنامج الفاصوليا', title_en: 'Beans Program', ...AGRI, aspect: '16:9', duration: '1:10' },
  { slug: 'lacquer', title_ar: 'اللاكيه', title_en: 'Lacquer', ...BRAND, aspect: '9:16', duration: '0:47' },
  { slug: 'sizing-king', title_ar: 'ملك التحجيم', title_en: 'King of Sizing', ...AGRI, aspect: '9:16', duration: '1:14' },
  { slug: 'potato', title_ar: 'كرتونة البطاطس', title_en: 'Potato Box', ...AGRI, aspect: '16:9', duration: '0:57' },
  { slug: 'agri-wheat-49', title_ar: 'تقاوي القمح ١٥ كيلو', title_en: 'Wheat Seeds 15kg', ...AGRI, aspect: '16:9', duration: '1:14' },
  { slug: 'wheat-2', title_ar: 'القمح — الجزء الثاني', title_en: 'Wheat — Part Two', ...AGRI, aspect: '16:9', duration: '0:37' },
  { slug: 'russian-wheat-4', title_ar: 'القمح الروسي — المصنع', title_en: 'Russian Wheat — The Mill', ...AGRI, aspect: '16:9', duration: '1:21' },
].map((p, i) => ({ ...p, ...m(p.slug), sort_order: i + 1 }));
