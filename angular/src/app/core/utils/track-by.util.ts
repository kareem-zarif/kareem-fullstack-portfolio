export function trackByRoute(index: number, item: { path?: string; route?: string }): string {
  return item.path ?? item.route ?? `${index}`;
}

export function trackById(index: number, item: { id: string }): string {
  return item.id;
}

export function trackBySlug(index: number, item: { slug: string }): string {
  return item.slug;
}
