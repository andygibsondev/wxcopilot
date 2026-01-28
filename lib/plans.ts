/**
 * Call limit plan tiers.
 * Free: 200 calls/day. Paid tiers: 900, 3600, 18000, 36000, 72000 per day.
 */

export type PlanId = 'free' | '900' | '3600' | '18000' | '36000' | '72000';

export interface Plan {
  id: PlanId;
  name: string;
  callsPerDay: number;
  /** Monthly cost in pence, null for free */
  monthlyPricePence: number | null;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    callsPerDay: 200,
    monthlyPricePence: null,
  },
  '900': {
    id: '900',
    name: '900 calls/day',
    callsPerDay: 900,
    monthlyPricePence: 800, // £8.00
  },
  '3600': {
    id: '3600',
    name: '3,600 calls/day',
    callsPerDay: 3600,
    monthlyPricePence: 3000, // £30.00
  },
  '18000': {
    id: '18000',
    name: '18,000 calls/day',
    callsPerDay: 18000,
    monthlyPricePence: 14000, // £140.00
  },
  '36000': {
    id: '36000',
    name: '36,000 calls/day',
    callsPerDay: 36000,
    monthlyPricePence: 24000, // £240.00
  },
  '72000': {
    id: '72000',
    name: '72,000 calls/day',
    callsPerDay: 72000,
    monthlyPricePence: 42000, // £420.00
  },
};

export function getPlan(planId: PlanId): Plan {
  return PLANS[planId];
}

export function getCallsPerDay(planId: PlanId): number {
  return PLANS[planId]?.callsPerDay ?? PLANS.free.callsPerDay;
}
