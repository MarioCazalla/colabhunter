-- ==========================================================================
-- ColabHunter - Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor to create the projects table.
-- ==========================================================================

-- 1. Create the Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    gene TEXT NOT NULL,
    title TEXT NOT NULL,
    ip TEXT NOT NULL,
    institution TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT 'catalonia',
    email TEXT NOT NULL,
    github TEXT,
    orcid TEXT,
    phone TEXT,
    mechanism TEXT NOT NULL,
    hpo_terms JSONB DEFAULT '[]'::jsonb,
    current_n INTEGER NOT NULL DEFAULT 1,
    target_n INTEGER NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'recruiting',
    status_label TEXT NOT NULL DEFAULT 'Reclutando Cohorte',
    models JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Indexes for High-Speed Genomic Searching
CREATE INDEX IF NOT EXISTS idx_projects_gene ON public.projects (UPPER(gene));
CREATE INDEX IF NOT EXISTS idx_projects_region ON public.projects (region);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects (status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies (Public Read & Authenticated/Public Insert)
CREATE POLICY "Allow public read access" 
ON public.projects FOR SELECT 
USING (true);

CREATE POLICY "Allow public project submission" 
ON public.projects FOR INSERT 
WITH CHECK (true);

-- 5. Insert Sample Demo Projects
INSERT INTO public.projects (id, gene, title, ip, institution, region, email, github, orcid, phone, mechanism, hpo_terms, current_n, target_n, status, status_label, models, description, visibility)
VALUES 
(
  'proj-001',
  'KCNQ2',
  'Caracterización funcional y clínica de variaciones missense en la poro-hélice de KCNQ2',
  'Dr. Xavier Pujol',
  'Hospital Sant Joan de Déu (SJD)',
  'catalonia',
  'xpujol@sjd.es',
  'https://github.com/pujol-genomics-sjd',
  '0000-0002-1829-4011',
  '+34 932 804 000 (ext. 4210)',
  'Gain-of-Function (GoF)',
  '[{"code": "HP:0001250", "name": "Seizures"}, {"code": "HP:0001263", "name": "Global developmental delay"}, {"code": "HP:0001290", "name": "Generalized hypotonia"}]'::jsonb,
  6,
  15,
  'functional',
  'Validación Funcional en Curso',
  '["Electrofisiología / Patch-clamp", "Biobanco de Muestras de ADN / ARN", "Líneas iPSC derivadas"]'::jsonb,
  'Buscamos ampliar nuestra cohorte de pacientes con encefalopatía epiléptica asociada a KCNQ2 con variantes missense.',
  'public'
),
(
  'proj-002',
  'SYNGAP1',
  'Estudio transcriptor de haploinsuficiencia en SYNGAP1 y respuesta a moduladores moleculares',
  'Dra. Elena Ramos',
  'Hospital Universitari Vall d''Hebron (HUVH)',
  'catalonia',
  'elena.ramos@vhir.org',
  'https://github.com/ramos-lab-vhir',
  '0000-0001-9402-3318',
  '+34 934 893 000 (ext. 2501)',
  'Loss-of-Function (LoF)',
  '[{"code": "HP:0000729", "name": "Autistic behavior"}, {"code": "HP:0001263", "name": "Global developmental delay"}, {"code": "HP:0001250", "name": "Seizures"}]'::jsonb,
  9,
  20,
  'recruiting',
  'Reclutando Cohorte',
  '["Modelos Animales (Ratón / Drosophila)", "Organoides cerebrales"]'::jsonb,
  'Proyecto enfocado en descifrar el espectro fenotípico de SYNGAP1 y validar tratamientos de lectura de codones de parada.',
  'public'
)
ON CONFLICT (id) DO NOTHING;
