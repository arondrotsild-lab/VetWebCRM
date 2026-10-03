export const CLIENT_VIP_ORDER_THRESHOLD = 10;

export type ClientSegment = "vip" | "regular" | "new";
export type ClientSegmentFilter = "all" | ClientSegment;

export function getClientSegment(ordersCount: number): ClientSegment {
  if (ordersCount > CLIENT_VIP_ORDER_THRESHOLD) return "vip";
  if (ordersCount > 0) return "regular";
  return "new";
}

export function getClientSegmentLabel(segment: ClientSegment): string {
  switch (segment) {
    case "vip":
      return "VIP";
    case "regular":
      return "Постоянный";
    case "new":
      return "Новый";
  }
}