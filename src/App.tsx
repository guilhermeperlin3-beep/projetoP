import { useMemo, useState } from 'react'
import {
  LayoutDashboard, CalendarDays, Handshake, BadgeDollarSign, FileText, Settings,
  Search, Plus, Bell, ChevronDown, Menu, X, ArrowUpRight, TrendingUp,
  Users, Target, Wallet, MoreHorizontal, Download, Sparkles, CheckCircle2,
  Clock3, CircleDollarSign, Building2, Mail, Phone, Trash2, Pencil, Eye
} from 'lucide-react'
import { seedEvents, seedSponsors, seedTiers } from './data'
import type { EventItem, Sponsor, SponsorStatus, Tier } from './types'
import { hasSupabase, supabase } from './lib/supabase'

type Page = 'Visão geral' | 'Eventos' | 'Patrocinadores' | 'Cotas e propostas' | 'Relatórios' | 'Configurações'
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const date = (v: string) => new Date(`${v}T12:00:00`).toLocaleDateString('pt-BR')

export default function App() {
  const [page, setPage] = useState<Page>('Visão geral')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [events, setEvents] = useState<EventItem[]>(seedEvents)
  const [sponsors, setSponsors] = useState<Sponsor[]>(seedSponsors)
  const [tiers, setTiers] = useState<Tier[]>(seedTiers)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<'event' | 'sponsor' | 'tier' | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [selectedEvent, setSelectedEvent] = useState('all')

  const totalGoal = events.reduce((a, e) => a + e.goal, 0)
  const totalRaised = events.reduce((a, e) => a + e.raised, 0)
  const confirmed = sponsors.filter(s => s.status === 'Confirmado').reduce((a, s) => a + s.value, 0)
  const filteredSponsors = sponsors.filter(s => (selectedEvent === 'all' || s.eventId === selectedEvent) && `${s.name} ${s.contact} ${s.segment}`.toLowerCase().includes(query.toLowerCase()))

  const nav: { name: Page; icon: typeof LayoutDashboard }[] = [
    { name: 'Visão geral', icon: LayoutDashboard }, { name: 'Eventos', icon: CalendarDays },
    { name: 'Patrocinadores', icon: Handshake }, { name: 'Cotas e propostas', icon: BadgeDollarSign },
    { name: 'Relatórios', icon: FileText }, { name: 'Configurações', icon: Settings }
  ]

  function notify(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  async function persistEvent(event: EventItem) {
    setEvents(old => editing ? old.map(x => x.id === editing ? event : x) : [event, ...old])
    if (supabase) {
      const { error } = await supabase.from('events').upsert({ id: event.id, name: event.name, event_date: event.date, venue: event.venue, fundraising_goal: event.goal, amount_raised: event.raised, status: event.status })
      if (error) notify(`Salvo localmente. Falha ao sincronizar: ${error.message}`)
      else notify('Evento salvo e sincronizado.')
    } else notify('Evento salvo nesta sessão. Configure o Supabase para persistir os dados.')
    setModal(null); setEditing(null)
  }

  async function persistSponsor(sponsor: Sponsor) {
    setSponsors(old => editing ? old.map(x => x.id === editing ? sponsor : x) : [sponsor, ...old])
    if (supabase) {
      const { error } = await supabase.from('sponsors').upsert({ id: sponsor.id, name: sponsor.name, contact_name: sponsor.contact, email: sponsor.email, segment: sponsor.segment, proposed_value: sponsor.value, status: sponsor.status, event_id: sponsor.eventId })
      if (error) notify(`Salvo localmente. Falha ao sincronizar: ${error.message}`)
      else notify('Patrocinador salvo e sincronizado.')
    } else notify('Patrocinador salvo nesta sessão. Configure o Supabase para persistir os dados.')
    setModal(null); setEditing(null)
  }

  const removeSponsor = async (id: string) => {
    setSponsors(s => s.filter(x => x.id !== id))
    if (supabase) await supabase.from('sponsors').delete().eq('id', id)
    notify('Patrocinador removido.')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark">P<span>ê</span></div><div><strong>PatrocinaAê</strong><small>GESTÃO DE PATROCÍNIOS</small></div><button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
      <div className="workspace"><div className="workspace-icon">IN</div><div><b>InovaMun</b><small>Espaço de trabalho</small></div><ChevronDown size={15}/></div>
      <div className="nav-label">MENU PRINCIPAL</div>
      <nav>{nav.map(item => <button key={item.name} className={`nav-item ${page === item.name ? 'active' : ''}`} onClick={() => { setPage(item.name); setMobileOpen(false) }}><item.icon size={18}/><span>{item.name}</span>{item.name === 'Patrocinadores' && <i>{sponsors.length}</i>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={17}/></div><b>Precisa de uma ideia?</b><p>Use o assistente para estruturar sua próxima proposta.</p><button onClick={() => notify('Assistente de IA: conecte uma API de IA no backend para habilitar esta função.')}>Explorar assistente <ArrowUpRight size={14}/></button></div><div className="profile"><div className="avatar">GP</div><div><b>Guilherme Perlin</b><small>Administrador</small></div><MoreHorizontal size={18}/></div></div>
    </aside>
    {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)}/>}
    <main className="main">
      <header className="topbar"><div className="top-left"><button className="menu-btn" onClick={() => setMobileOpen(true)}><Menu/></button><span>InovaMun</span><span className="crumb">/</span><b>{page}</b></div><div className="top-actions"><div className="searchbox"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar..." /></div><button className="icon-btn" onClick={() => notify('Você está em dia!')}><Bell size={18}/><em/></button><div className="top-avatar">GP</div></div></header>
      <div className="content">
        {page === 'Visão geral' && <Dashboard events={events} sponsors={sponsors} totalGoal={totalGoal} totalRaised={totalRaised} confirmed={confirmed} onNew={() => { setEditing(null); setModal('event') }} onPage={setPage}/>}
        {page === 'Eventos' && <EventsPage events={events} onNew={() => { setEditing(null); setModal('event') }} onEdit={e => { setEditing(e.id); setModal('event') }} onDelete={id => { setEvents(x => x.filter(e => e.id !== id)); notify('Evento removido.') }}/>}
        {page === 'Patrocinadores' && <SponsorsPage sponsors={filteredSponsors} events={events} query={query} setQuery={setQuery} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} onNew={() => { setEditing(null); setModal('sponsor') }} onEdit={s => { setEditing(s.id); setModal('sponsor') }} onDelete={removeSponsor}/>}
        {page === 'Cotas e propostas' && <TiersPage tiers={tiers} setTiers={setTiers} onNew={() => { setEditing(null); setModal('tier') }}/>}
        {page === 'Relatórios' && <Reports events={events} sponsors={sponsors}/>}
        {page === 'Configurações' && <SettingsPage/>}
      </div>
    </main>
    {modal && <Modal title={modal === 'event' ? (editing ? 'Editar evento' : 'Novo evento') : modal === 'sponsor' ? (editing ? 'Editar patrocinador' : 'Adicionar patrocinador') : 'Nova cota'} onClose={() => { setModal(null); setEditing(null) }}>
      {modal === 'event' ? <EventForm initial={events.find(e => e.id === editing)} onSave={persistEvent} onCancel={() => setModal(null)}/> : modal === 'sponsor' ? <SponsorForm initial={sponsors.find(s => s.id === editing)} events={events} onSave={persistSponsor} onCancel={() => setModal(null)}/> : <TierForm onSave={t => { setTiers(x => [...x, t]); setModal(null); notify('Cota adicionada.') }} onCancel={() => setModal(null)}/>}
    </Modal>}
    {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
    <footer className="footer">PatrocinaAê <span>•</span> Plataforma de gestão de patrocínios <span className="connection">{hasSupabase ? '● Supabase conectado' : '● Modo demonstração'}</span></footer>
  </div>
}

function PageHeading({ eyebrow, title, desc, action, onAction }: { eyebrow: string; title: string; desc: string; action?: string; onAction?: () => void }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{desc}</p></div>{action && <button className="primary-btn" onClick={onAction}><Plus size={17}/>{action}</button>}</div>
}
function Dashboard({ events, sponsors, totalGoal, totalRaised, confirmed, onNew, onPage }: { events: EventItem[]; sponsors: Sponsor[]; totalGoal: number; totalRaised: number; confirmed: number; onNew: () => void; onPage: (p: Page) => void }) {
  const pct = totalGoal ? Math.round(totalRaised / totalGoal * 100) : 0
  return <>
    <PageHeading eyebrow="PAINEL DE CONTROLE" title="Visão geral" desc="Acompanhe seus eventos, oportunidades e resultados de patrocínio." action="Novo evento" onAction={onNew}/>
    <div className="welcome-strip"><div><span>SEU ECOSSISTEMA EM MOVIMENTO</span><h2>Boas-vindas ao PatrocinaAê 👋</h2><p>Organize oportunidades, fortaleça parcerias e acompanhe cada conquista.</p></div><div className="strip-art"><div className="art-circle one"/><div className="art-circle two"/><TrendingUp size={52}/></div></div>
    <div className="stats-grid">
      <Stat icon={<CalendarDays/>} label="Eventos ativos" value={String(events.filter(e => e.status !== 'Realizado').length)} foot={`${events.length} eventos cadastrados`} tone="green"/>
      <Stat icon={<Wallet/>} label="Total captado" value={money(totalRaised)} foot={`${pct}% da meta total`} tone="blue"/>
      <Stat icon={<Target/>} label="Meta de captação" value={money(totalGoal)} foot="Somatório das metas dos eventos" tone="orange"/>
      <Stat icon={<Handshake/>} label="Patrocínios confirmados" value={money(confirmed)} foot={`${sponsors.filter(s => s.status === 'Confirmado').length} parceiros confirmados`} tone="purple"/>
    </div>
    <div className="dashboard-grid"><section className="panel wide"><div className="panel-head"><div><h3>Seus eventos</h3><p>Visão rápida dos eventos em andamento</p></div><button className="text-btn" onClick={() => onPage('Eventos')}>Ver todos <ArrowUpRight size={14}/></button></div><div className="event-list">{events.slice(0,3).map(e => <EventRow key={e.id} event={e}/>)}</div></section>
      <section className="panel"><div className="panel-head"><div><h3>Pipeline de patrocínios</h3><p>Oportunidades por etapa</p></div></div><Pipeline sponsors={sponsors}/></section>
      <section className="panel"><div className="panel-head"><div><h3>Atividade recente</h3><p>Movimentações da sua equipe</p></div></div><div className="activity-list"><Activity icon={<CheckCircle2/>} title="Sicredi confirmado" sub="Fronteira Summit 2027" time="Hoje"/><Activity icon={<Clock3/>} title="Multilog em negociação" sub="Fronteira Summit 2027" time="Ontem"/><Activity icon={<Users/>} title="Novo prospect cadastrado" sub="Agrovit • Ideathon 2027" time="Há 2 dias"/></div></section>
      <section className="panel wide"><div className="panel-head"><div><h3>Oportunidades em destaque</h3><p>Próximas ações para avançar sua captação</p></div><button className="text-btn" onClick={() => onPage('Patrocinadores')}>Abrir CRM <ArrowUpRight size={14}/></button></div><div className="opportunity"><div className="op-icon"><Building2/></div><div><b>{sponsors.filter(s => s.status !== 'Confirmado').length} empresas aguardando avanço</b><p>Atualize os contatos e registre o próximo passo de cada negociação.</p></div><button className="outline-btn" onClick={() => onPage('Patrocinadores')}>Ver oportunidades</button></div></section>
    </div>
  </>
}
function Stat({ icon, label, value, foot, tone }: { icon: React.ReactNode; label: string; value: string; foot: string; tone: string }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><strong>{value}</strong><small>{foot}</small></div>
}
function EventRow({ event }: { event: EventItem }) {
  const p = Math.min(100, Math.round(event.raised / event.goal * 100))
  return <div className="event-row"><div className="event-date"><b>{new Date(`${event.date}T12:00:00`).getDate()}</b><small>{new Date(`${event.date}T12:00:00`).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</small></div><div className="event-info"><b>{event.name}</b><small><CalendarDays size={12}/> {date(event.date)} <span>•</span> {event.venue}</small><div className="progress"><i style={{width:`${p}%`}}/></div></div><div className="event-money"><b>{money(event.raised)}</b><small>de {money(event.goal)}</small></div><span className={`status ${event.status === 'Realizado' ? 'done' : 'active-status'}`}>{event.status}</span></div>
}
function Pipeline({ sponsors }: { sponsors: Sponsor[] }) {
  const stages: SponsorStatus[] = ['Prospect','Em negociação','Confirmado']
  const colors = ['#a8b5af','#e9a64b','#4b9a73']
  return <div className="pipeline">{stages.map((s,i) => <div className="pipe-row" key={s}><div className="pipe-label"><span style={{background:colors[i]}}/>{s}<b>{sponsors.filter(x => x.status === s).length}</b></div><div className="pipe-track"><i style={{width:`${sponsors.length ? sponsors.filter(x => x.status === s).length / sponsors.length * 100 : 0}%`,background:colors[i]}}/></div></div>)}</div>
}
function Activity({ icon, title, sub, time }: { icon: React.ReactNode; title: string; sub: string; time: string }) { return <div className="activity"><div className="activity-icon">{icon}</div><div><b>{title}</b><small>{sub}</small></div><time>{time}</time></div> }
function EventsPage({ events, onNew, onEdit, onDelete }: { events: EventItem[]; onNew: () => void; onEdit: (e: EventItem) => void; onDelete: (id: string) => void }) {
  return <><PageHeading eyebrow="GESTÃO" title="Eventos" desc="Cadastre eventos e acompanhe suas metas de captação." action="Novo evento" onAction={onNew}/><div className="event-cards">{events.map(e => <div className="panel event-card" key={e.id}><div className="event-card-top"><span className="event-card-icon"><CalendarDays/></span><span className="status active-status">{e.status}</span></div><h3>{e.name}</h3><p><CalendarDays size={14}/> {date(e.date)}</p><p><Building2 size={14}/> {e.venue}</p><div className="card-progress"><div><small>Captação</small><b>{Math.round(e.raised/e.goal*100)}%</b></div><div className="progress"><i style={{width:`${Math.min(100,e.raised/e.goal*100)}%`}}/></div><div className="card-amount"><b>{money(e.raised)}</b><small>Meta: {money(e.goal)}</small></div></div><div className="card-actions"><button onClick={() => onEdit(e)}><Pencil size={14}/> Editar</button><button className="danger-text" onClick={() => onDelete(e.id)}><Trash2 size={14}/> Excluir</button></div></div>)}</div>{!events.length && <Empty title="Nenhum evento cadastrado" text="Crie seu primeiro evento para começar a captar patrocínios."/>}</>
}
function SponsorsPage({ sponsors, events, query, setQuery, selectedEvent, setSelectedEvent, onNew, onEdit, onDelete }: { sponsors: Sponsor[]; events: EventItem[]; query: string; setQuery: (s: string) => void; selectedEvent: string; setSelectedEvent: (s: string) => void; onNew: () => void; onEdit: (s: Sponsor) => void; onDelete: (id: string) => void }) {
  return <><PageHeading eyebrow="RELACIONAMENTO" title="Patrocinadores" desc="Gerencie empresas, contatos e o andamento das negociações." action="Adicionar patrocinador" onAction={onNew}/><div className="panel table-panel"><div className="table-toolbar"><div className="searchbox table-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empresa ou contato..."/></div><select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}><option value="all">Todos os eventos</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div><div className="table-wrap"><table><thead><tr><th>EMPRESA</th><th>CONTATO</th><th>EVENTO</th><th>VALOR</th><th>ETAPA</th><th>AÇÕES</th></tr></thead><tbody>{sponsors.map(s=><tr key={s.id}><td><div className="company-cell"><div className="company-avatar">{s.name.slice(0,2).toUpperCase()}</div><div><b>{s.name}</b><small>{s.segment}</small></div></div></td><td><b>{s.contact}</b><small className="subline">{s.email}</small></td><td>{events.find(e=>e.id===s.eventId)?.name || '—'}</td><td><b>{money(s.value)}</b></td><td><span className={`status ${s.status==='Confirmado'?'done':s.status==='Em negociação'?'negotiating':'prospect'}`}>{s.status}</span></td><td><div className="action-buttons"><button title="Editar" onClick={()=>onEdit(s)}><Pencil size={15}/></button><button title="Excluir" onClick={()=>onDelete(s.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>{!sponsors.length && <Empty title="Nenhum resultado" text="Tente alterar os filtros ou cadastre um novo patrocinador."/>}</div></>
}
function TiersPage({ tiers, setTiers, onNew }: { tiers: Tier[]; setTiers: React.Dispatch<React.SetStateAction<Tier[]>>; onNew: () => void }) {
  return <><PageHeading eyebrow="COMERCIAL" title="Cotas e propostas" desc="Estruture entregas e valores para apresentar aos patrocinadores." action="Criar cota" onAction={onNew}/><div className="tier-grid">{tiers.map((t,i)=><div className={`panel tier-card tier-${i%3}`} key={t.id}><div className="tier-symbol"><BadgeDollarSign/></div><div className="tier-name">COTA {t.name.toUpperCase()}</div><h2>{money(t.price)}</h2><p>Investimento por evento</p><div className="tier-divider"/><b>Contrapartidas incluídas</b><ul>{t.benefits.map(b=><li key={b}><CheckCircle2 size={15}/>{b}</li>)}</ul><button className="outline-btn full" onClick={()=>navigator.clipboard?.writeText(`${t.name} — ${money(t.price)}\n${t.benefits.map(b=>'• '+b).join('\n')}`)}> <Download size={15}/> Copiar proposta</button><button className="remove-tier" onClick={()=>setTiers(x=>x.filter(y=>y.id!==t.id))}>Remover cota</button></div>)}</div><div className="panel info-banner"><Sparkles/><div><b>Dica para uma proposta mais forte</b><p>Apresente benefícios mensuráveis, oportunidades de relacionamento e indicadores de visibilidade para cada faixa de investimento.</p></div></div></>
}
function Reports({ events, sponsors }: { events: EventItem[]; sponsors: Sponsor[] }) {
  const sum = sponsors.reduce((a,s)=>a+s.value,0)
  const confirmed = sponsors.filter(s=>s.status==='Confirmado').reduce((a,s)=>a+s.value,0)
  return <><PageHeading eyebrow="ANÁLISE" title="Relatórios" desc="Indicadores consolidados da sua operação de patrocínios."/><div className="stats-grid"><Stat icon={<CircleDollarSign/>} label="Pipeline total" value={money(sum)} foot="Todas as oportunidades" tone="green"/><Stat icon={<CheckCircle2/>} label="Valor confirmado" value={money(confirmed)} foot="Negócios fechados" tone="blue"/><Stat icon={<Target/>} label="Taxa de conversão" value={`${sum ? Math.round(confirmed/sum*100) : 0}%`} foot="Sobre o valor do pipeline" tone="purple"/><Stat icon={<Users/>} label="Empresas no CRM" value={String(sponsors.length)} foot="Prospects e parceiros" tone="orange"/></div><div className="panel report-panel"><div className="panel-head"><div><h3>Desempenho por evento</h3><p>Captação realizada em relação à meta</p></div><button className="outline-btn" onClick={()=>window.print()}><Download size={15}/> Exportar / imprimir</button></div>{events.map(e=><div className="report-row" key={e.id}><div><b>{e.name}</b><small>{date(e.date)}</small></div><div className="report-bar"><div className="progress"><i style={{width:`${Math.min(100,e.raised/e.goal*100)}%`}}/></div><small>{Math.round(e.raised/e.goal*100)}%</small></div><b>{money(e.raised)}</b></div>)}</div></>
}
function SettingsPage() {
  return <><PageHeading eyebrow="PREFERÊNCIAS" title="Configurações" desc="Ajuste sua organização e a conexão com os serviços da plataforma."/><div className="settings-grid"><div className="panel settings-panel"><div className="panel-head"><div><h3>Organização</h3><p>Dados do espaço de trabalho</p></div></div><label>Nome da organização<input defaultValue="InovaMun"/></label><label>Responsável<input defaultValue="Guilherme Perlin"/></label><label>E-mail de contato<input defaultValue="contato@inovamun.com.br"/></label><button className="primary-btn" onClick={()=>alert('Configurações de demonstração.')}>Salvar alterações</button></div><div className="panel settings-panel"><div className="panel-head"><div><h3>Integrações</h3><p>Serviços conectados à aplicação</p></div></div><div className="integration"><div className="integration-logo">S</div><div><b>Supabase</b><small>Banco de dados e autenticação</small></div><span className={`status ${hasSupabase?'done':'prospect'}`}>{hasSupabase?'Conectado':'Não configurado'}</span></div><div className="integration"><div className="integration-logo ai">✦</div><div><b>Assistente de IA</b><small>Geração de propostas e textos</small></div><span className="status prospect">Em breve</span></div><p className="settings-note">Para habilitar o banco de dados, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.</p></div></div></>
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X size={19}/></button></div>{children}</div></div>
}
function EventForm({ initial, onSave, onCancel }: { initial?: EventItem; onSave: (e: EventItem)=>void; onCancel: ()=>void }) {
  const [name,setName]=useState(initial?.name||''); const [dateValue,setDateValue]=useState(initial?.date||'2027-01-01'); const [venue,setVenue]=useState(initial?.venue||''); const [goal,setGoal]=useState(String(initial?.goal||'')); const [raised,setRaised]=useState(String(initial?.raised||0)); const [status,setStatus]=useState<EventItem['status']>(initial?.status||'Planejamento')
  return <form className="form" onSubmit={e=>{e.preventDefault();onSave({id:initial?.id||crypto.randomUUID(),name,date:dateValue,venue,goal:Number(goal),raised:Number(raised),status})}}><label>Nome do evento<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Fronteira Summit 2027"/></label><div className="form-row"><label>Data<input type="date" required value={dateValue} onChange={e=>setDateValue(e.target.value)}/></label><label>Status<select value={status} onChange={e=>setStatus(e.target.value as EventItem['status'])}><option>Planejamento</option><option>Captação</option><option>Realizado</option></select></label></div><label>Local<input required value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Local do evento"/></label><div className="form-row"><label>Meta de captação (R$)<input type="number" min="0" required value={goal} onChange={e=>setGoal(e.target.value)}/></label><label>Valor já captado (R$)<input type="number" min="0" value={raised} onChange={e=>setRaised(e.target.value)}/></label></div><div className="modal-actions"><button type="button" className="outline-btn" onClick={onCancel}>Cancelar</button><button className="primary-btn">Salvar evento</button></div></form>
}
function SponsorForm({ initial, events, onSave, onCancel }: { initial?: Sponsor; events: EventItem[]; onSave: (s:Sponsor)=>void; onCancel: ()=>void }) {
  const [name,setName]=useState(initial?.name||'');const [contact,setContact]=useState(initial?.contact||'');const [email,setEmail]=useState(initial?.email||'');const [segment,setSegment]=useState(initial?.segment||'');const [value,setValue]=useState(String(initial?.value||''));const [status,setStatus]=useState<SponsorStatus>(initial?.status||'Prospect');const [eventId,setEventId]=useState(initial?.eventId||events[0]?.id||'')
  return <form className="form" onSubmit={e=>{e.preventDefault();onSave({id:initial?.id||crypto.randomUUID(),name,contact,email,segment,value:Number(value),status,eventId})}}><label>Empresa<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da empresa"/></label><div className="form-row"><label>Nome do contato<input required value={contact} onChange={e=>setContact(e.target.value)}/></label><label>Segmento<input value={segment} onChange={e=>setSegment(e.target.value)} placeholder="Ex.: Agronegócio"/></label></div><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="contato@empresa.com"/></label><div className="form-row"><label>Valor potencial (R$)<input type="number" min="0" required value={value} onChange={e=>setValue(e.target.value)}/></label><label>Etapa<select value={status} onChange={e=>setStatus(e.target.value as SponsorStatus)}><option>Prospect</option><option>Em negociação</option><option>Confirmado</option></select></label></div><label>Evento<select required value={eventId} onChange={e=>setEventId(e.target.value)}>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label><div className="modal-actions"><button type="button" className="outline-btn" onClick={onCancel}>Cancelar</button><button className="primary-btn">Salvar patrocinador</button></div></form>
}
function TierForm({ onSave, onCancel }: { onSave: (t:Tier)=>void; onCancel: ()=>void }) {
  const [name,setName]=useState('');const [price,setPrice]=useState('');const [benefits,setBenefits]=useState('')
  return <form className="form" onSubmit={e=>{e.preventDefault();onSave({id:crypto.randomUUID(),name,price:Number(price),benefits:benefits.split('\n').map(x=>x.trim()).filter(Boolean)})}}><label>Nome da cota<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: Diamante"/></label><label>Valor (R$)<input required type="number" min="0" value={price} onChange={e=>setPrice(e.target.value)}/></label><label>Contrapartidas (uma por linha)<textarea rows={5} value={benefits} onChange={e=>setBenefits(e.target.value)} placeholder={'Logo em destaque\\nEspaço de ativação\\nCredenciais VIP'}/></label><div className="modal-actions"><button type="button" className="outline-btn" onClick={onCancel}>Cancelar</button><button className="primary-btn">Criar cota</button></div></form>
}
function Empty({ title, text }: { title: string; text: string }) { return <div className="empty"><div><Search size={22}/></div><b>{title}</b><p>{text}</p></div> }
