alter table public.properties
  add column property_category text
  constraint properties_property_category_check
  check (property_category in ('house', 'apartment', 'condo', 'townhouse'));

comment on column public.properties.property_category is
  'Physical property category; null for listings created before this field was collected.';
