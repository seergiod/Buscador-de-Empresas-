
-- Searches table
CREATE TABLE public.searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_label TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID NOT NULL REFERENCES public.searches(id) ON DELETE CASCADE,
  place_id TEXT,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  rating NUMERIC,
  contacted BOOLEAN NOT NULL DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_searches_user ON public.searches(user_id);
CREATE INDEX idx_results_search ON public.search_results(search_id);

ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;

-- Searches: only owner
CREATE POLICY "own searches select" ON public.searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own searches insert" ON public.searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own searches update" ON public.searches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own searches delete" ON public.searches FOR DELETE USING (auth.uid() = user_id);

-- Results: owner via parent search
CREATE POLICY "own results select" ON public.search_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.searches s WHERE s.id = search_id AND s.user_id = auth.uid()));
CREATE POLICY "own results insert" ON public.search_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.searches s WHERE s.id = search_id AND s.user_id = auth.uid()));
CREATE POLICY "own results update" ON public.search_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.searches s WHERE s.id = search_id AND s.user_id = auth.uid()));
CREATE POLICY "own results delete" ON public.search_results FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.searches s WHERE s.id = search_id AND s.user_id = auth.uid()));
