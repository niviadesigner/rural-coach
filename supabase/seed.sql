-- ============================================================
-- RURAL COACH — Datos de ejemplo
-- Eventos Rural Cycle + códigos de descuento.
-- Ejecutar después de schema.sql.
-- ============================================================

insert into public.events (nombre, es_rural_cycle, fecha, ciudad, distancia_km, desnivel_m, pct_gravel, dificultad, descripcion, imagen_url)
values
  ('Pantano Martus', true, '2026-11-21', 'Sopó, Cundinamarca', 90, 2300, 60, 4,
   'El reto insignia de Rural Cycle en La Sabana: 90 km con 2.300 m de desnivel y 60% de gravel. Terreno suelto, cambios de superficie y subidas largas donde se define todo.',
   'https://ruralcycle.cc/imagenes/tarjeta-pantano.webp'),
  ('Rural Gravel Tour · Suesca', true, '2026-12-06', 'Suesca, Cundinamarca', 75, 1600, 55, 3,
   'Paisajes de roca y páramo entre caminos poco transitados. 75 km rápidos y técnicos, ideales para estrenar forma de fin de temporada.',
   'https://ruralcycle.cc/imagenes/tarjeta-suesca.webp'),
  ('Reto Basso Gravel', true, '2027-02-14', 'La Calera, Cundinamarca', 110, 3100, 70, 5,
   'El más duro del calendario: 110 km, 3.100 m de desnivel y 70% de gravel de alta montaña. Solo para quienes buscan el podio.',
   'https://ruralcycle.cc/imagenes/basso.png')
on conflict do nothing;

-- Código de evento Martus: -15%
insert into public.discount_codes (codigo, event_id, descuento_pct, valido_hasta, usos_max, usos_actuales)
select 'MARTUS15', e.id, 15, '2026-11-20', 500, 0
from public.events e where e.nombre = 'Pantano Martus'
on conflict (codigo) do nothing;

-- Código general Rural Cycle: -15% en cualquier plan
insert into public.discount_codes (codigo, event_id, descuento_pct, valido_hasta, usos_max, usos_actuales)
select 'RURAL15', e.id, 15, '2027-12-31', 9999, 0
from public.events e where e.nombre = 'Pantano Martus'
on conflict (codigo) do nothing;
