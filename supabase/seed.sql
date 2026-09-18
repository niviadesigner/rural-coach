-- ============================================================
-- RURAL COACH — Datos de ejemplo
-- Eventos destacados 2026 + código de descuento.
-- Ejecutar después de schema.sql.
-- ============================================================

insert into public.events (nombre, es_rural_cycle, fecha, ciudad, distancia_km, desnivel_m, pct_gravel, dificultad, descripcion, imagen_url)
values
  ('Brutal Gravel Race', false, '2026-10-11', 'Sáchica, Boyacá', 130, 2400, 80, 5,
   'Carrera de gravel con dos distancias (60 km y 130 km) en Sáchica, Boyacá. 80% de terreno suelto y exigente.',
   '/eventos/brutal-gravel.png'),
  ('Giro de Rigo', false, '2026-11-01', 'Cali, Valle del Cauca', 180, 3200, 0, 5,
   'La carrera de ruta más importante de Colombia para ciclistas aficionados. Edición La Sucursal — Cali.',
   '/eventos/giro-de-rigo.png'),
  ('Campeonato Nacional de Gravel', false, '2026-11-15', 'Santa Rosa de Cabal, Risaralda', 120, 2800, 70, 4,
   'Carrera de gravel donde se premia al campeón nacional de Colombia de la modalidad. Competencia por categorías de edad.',
   '/eventos/campeonato-nacional-gravel.png'),
  ('Transcordilleras · 3 etapas', false, '2026-12-05', 'Jardín, Antioquia', 258, 6900, 70, 5,
   'Carrera de gravel por etapas: bikepacking autoabastecido. 258 km y 6.900 m de desnivel entre cordilleras.',
   '/eventos/transcordilleras.png')
on conflict do nothing;

-- Código general Rural Cycle: -15% en cualquier plan
insert into public.discount_codes (codigo, event_id, descuento_pct, valido_hasta, usos_max, usos_actuales)
select 'RURAL15', e.id, 15, '2027-12-31', 9999, 0
from public.events e where e.nombre = 'Brutal Gravel Race'
on conflict (codigo) do nothing;
