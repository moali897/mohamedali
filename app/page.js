import Site from './Site';
import { FALLBACK_PROJECTS } from '../lib/projects';
import { supabase } from '../lib/supabase';

export const revalidate = 300; // pick up new projects from Supabase every 5 minutes

async function getProjects() {
  if (!supabase) return FALLBACK_PROJECTS;
  const { data, error } = await supabase
    .from('projects')
    .select('slug,title_ar,title_en,category,category_ar,category_en,aspect,duration,video_url,loop_url,poster_url,sort_order')
    .eq('published', true)
    .order('sort_order', { ascending: true });
  if (error || !data || data.length === 0) return FALLBACK_PROJECTS;
  return data;
}

export default async function Page() {
  const projects = await getProjects();
  return <Site projects={projects} />;
}
