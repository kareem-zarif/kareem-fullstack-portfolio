export function trackByRoute(index: number, item: { route: string }): string {
  return item.route;
}

export function trackById(index: number, item: { id: string }): string {
  return item.id;
}

export function trackBySlug(index: number, item: { slug: string }): string {
  return item.slug;
}
