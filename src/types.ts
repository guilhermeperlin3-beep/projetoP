export type EventStatus = 'Planejamento' | 'Captação' | 'Realizado'
export type EventItem = {
  id: string; name: string; date: string; venue: string; goal: number; raised: number; status: EventStatus
}
export type SponsorStatus = 'Prospect' | 'Em negociação' | 'Confirmado'
export type Sponsor = {
  id: string; name: string; contact: string; email: string; segment: string
  value: number; status: SponsorStatus; eventId: string
}
export type Tier = { id: string; name: string; price: number; benefits: string[] }
