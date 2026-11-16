import type { EventItem, Sponsor, Tier } from './types'

export const seedEvents: EventItem[] = [
  { id: 'evt-1', name: 'Fronteira Summit 2027', date: '2027-11-12', venue: 'Teatro Rosalina Pandolfo Lisboa', goal: 90000, raised: 58400, status: 'Captação' },
  { id: 'evt-2', name: 'Ideathon 2027', date: '2027-08-24', venue: 'Uruguaiana/RS', goal: 18000, raised: 7200, status: 'Captação' },
  { id: 'evt-3', name: 'Startup Weekend Fronteira', date: '2027-12-04', venue: 'Uruguaiana/RS', goal: 30000, raised: 12000, status: 'Planejamento' }
]
export const seedSponsors: Sponsor[] = [
  { id: 'sp-1', name: 'Sicredi', contact: 'Mariana Costa', email: 'mariana@exemplo.com', segment: 'Financeiro', value: 15000, status: 'Confirmado', eventId: 'evt-1' },
  { id: 'sp-2', name: 'Multilog', contact: 'Rafael Souza', email: 'rafael@exemplo.com', segment: 'Logística', value: 12000, status: 'Em negociação', eventId: 'evt-1' },
  { id: 'sp-3', name: 'Agrovit', contact: 'Paulo Lima', email: 'paulo@exemplo.com', segment: 'Agronegócio', value: 5000, status: 'Prospect', eventId: 'evt-2' },
  { id: 'sp-4', name: 'ACIU', contact: 'Ana Martins', email: 'ana@exemplo.com', segment: 'Institucional', value: 8000, status: 'Confirmado', eventId: 'evt-2' },
  { id: 'sp-5', name: 'Varela Imóveis', contact: 'João Varela', email: 'joao@exemplo.com', segment: 'Imobiliário', value: 6000, status: 'Em negociação', eventId: 'evt-3' }
]
export const seedTiers: Tier[] = [
  { id: 'tier-1', name: 'Ouro', price: 10000, benefits: ['Logo em destaque', 'Espaço de ativação', '5 credenciais VIP', 'Menção em palco'] },
  { id: 'tier-2', name: 'Prata', price: 5000, benefits: ['Logo em materiais', '3 credenciais VIP', 'Menção nas redes sociais'] },
  { id: 'tier-3', name: 'Bronze', price: 2500, benefits: ['Logo no site', '2 credenciais', 'Agradecimento institucional'] }
]
