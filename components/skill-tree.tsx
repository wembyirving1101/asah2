'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bot, Brain, Check, ChevronDown, CircleHelp, Crosshair, Flame, Home, Minus, Move, PanelBottom, Plus, Search, Sparkles, Target, UserRound, X, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SkillStatus = 'mastered' | 'proficient' | 'learning' | 'needs' | 'assessed'
type SkillType = 'Quantitative' | 'Verbal' | 'Reasoning' | 'Literacy'
type UTBKDomain = 'Overall' | 'PPU' | 'PBM' | 'PK' | 'LBI' | 'LBE' | 'PM'
type SkillNode = { id: string; name: string; short?: string; status: SkillStatus; type: SkillType[]; progress: number; domains: UTBKDomain[]; description?: string; practice: string; usedIn: string; direction: string }
type SkillEdge = { id: string; source: string; target: string }
type PositionedNode = SkillNode & { x: number; y: number }
const parentIds = ['verbal', 'quant', 'reasoning', 'literacy'] as const
const branchOrder = { verbal: 'up', quant: 'right', reasoning: 'left', literacy: 'down' } as const
const nodeSize = { parent: 126, childWidth: 138, childHeight: 74, root: 180 }

function layoutGraph(source: SkillNode[], edges: SkillEdge[]): { nodes: PositionedNode[]; connections: SkillEdge[] } {
  const root: PositionedNode = { ...source.find((node) => node.id === 'root')!, x: 600, y: 410 }
  const parents = source.filter((node) => parentIds.includes(node.id as typeof parentIds[number]))
  const children = source.filter((node) => node.id !== 'root' && !parentIds.includes(node.id as typeof parentIds[number]))
  const positioned: PositionedNode[] = [root]
  const domainGap = 260
  const centers = {
    verbal: { x: root.x, y: root.y - domainGap },
    quant: { x: root.x + domainGap, y: root.y },
    reasoning: { x: root.x - domainGap, y: root.y },
    literacy: { x: root.x, y: root.y + domainGap },
  }
  parents.forEach((parent) => {
    const center = centers[parent.id as keyof typeof centers]
    positioned.push({ ...parent, x: center.x, y: center.y })
    const branchChildren = children.filter((child) => edges.some((edge) => edge.source === parent.id && edge.target === child.id))
    const direction = branchOrder[parent.id as keyof typeof branchOrder]
    const availableSpan = direction === 'up' || direction === 'down' ? 520 : 400
    const gap = branchChildren.length > 1 ? Math.min(180, availableSpan / (branchChildren.length - 1)) : 0
    branchChildren.forEach((child, index) => {
      const offset = (index - (branchChildren.length - 1) / 2) * gap
      const point = direction === 'up' ? { x: center.x + offset, y: center.y - 220 } : direction === 'down' ? { x: center.x + offset, y: center.y + 130 } : direction === 'left' ? { x: center.x - 220, y: center.y + offset } : { x: center.x + 220, y: center.y + offset }
      positioned.push({ ...child, x: point.x, y: point.y })
    })
  })
  const connections: SkillEdge[] = edges.filter((edge) => positioned.some((node) => node.id === edge.source) && positioned.some((node) => node.id === edge.target))
  return { nodes: positioned, connections }
}

const statusMeta: Record<SkillStatus, { label: string; color: string; icon: typeof Check }> = {
  mastered: { label: 'Mastered', color: 'cyan', icon: Sparkles },
  proficient: { label: 'Proficient', color: 'green', icon: Check },
  learning: { label: 'Learning', color: 'blue', icon: Zap },
  needs: { label: 'Needs work', color: 'orange', icon: Flame },
  assessed: { label: 'Not assessed', color: 'slate', icon: CircleHelp },
}

const nodes: SkillNode[] = [
  { id: 'root', name: 'UTBK CORE', status: 'mastered', type: ['Reasoning'], progress: 76, domains: ['Overall'], practice: '298 questions · 84% accuracy', usedIn: 'All domains', direction: 'Your foundation' },
  { id: 'verbal', name: 'Verbal', status: 'proficient', type: ['Verbal', 'Literacy'], progress: 81, domains: ['PBM', 'LBI', 'LBE'], practice: '74 questions · 79% accuracy', usedIn: 'PBM · LBI · LBE', direction: 'Up branch' },
  { id: 'quant', name: 'Kuantitatif', status: 'learning', type: ['Quantitative', 'Reasoning'], progress: 68, domains: ['PK', 'PM', 'PU'], practice: '143 questions · 78% accuracy', usedIn: 'PK · PM · PU', direction: 'Right branch' },
  { id: 'reasoning', name: 'Penalaran', status: 'proficient', type: ['Reasoning'], progress: 86, domains: ['PU', 'PM'], practice: '91 questions · 88% accuracy', usedIn: 'PU · PM', direction: 'Left branch' },
  { id: 'literacy', name: 'Literasi', status: 'needs', type: ['Literacy', 'Verbal'], progress: 54, domains: ['LBI', 'LBE'], practice: '86 questions · 62% accuracy', usedIn: 'LBI · LBE', direction: 'Down branch' },
  { id: 'inference', name: 'Inference', status: 'mastered', type: ['Literacy', 'Reasoning'], progress: 91, domains: ['PBM', 'LBI', 'LBE'], practice: '48 questions · 92% accuracy', usedIn: 'PBM · LBI · LBE', direction: 'Verbal skill' },
  { id: 'argument', name: 'Argument\nevaluation', status: 'learning', type: ['Literacy', 'Verbal', 'Reasoning'], progress: 64, domains: ['PBM', 'LBI'], practice: '32 questions · 71% accuracy', usedIn: 'PBM · LBI', direction: 'Verbal skill' },
  { id: 'equations', name: 'Number', status: 'needs', type: ['Quantitative'], progress: 48, domains: ['PK', 'PM'], practice: '57 questions · 55% accuracy', usedIn: 'PK · PM', direction: 'Quant skill' },
  { id: 'data', name: 'Geometri', status: 'assessed', type: ['Quantitative', 'Reasoning'], progress: 0, domains: ['PK', 'PM', 'PU'], practice: '39 questions · 73% accuracy', usedIn: 'PK · PM · PU', direction: 'Quant skill' },
  { id: 'patterns', name: 'Pattern\nrecognition', status: 'proficient', type: ['Reasoning'], progress: 83, domains: ['PU', 'PM'], practice: '41 questions · 86% accuracy', usedIn: 'PU · PM', direction: 'Reasoning skill' },
  { id: 'main-idea', name: 'Main idea', status: 'needs', type: ['Literacy', 'Verbal'], progress: 52, domains: ['LBI', 'LBE'], practice: '38 questions · 61% accuracy', usedIn: 'LBI · LBE', direction: 'Literacy skill' },
  { id: 'integration', name: 'Information\nintegration', status: 'assessed', type: ['Literacy', 'Reasoning'], progress: 0, domains: ['LBI', 'LBE'], practice: 'Not started', usedIn: 'LBI · LBE', direction: 'Literacy skill' },
]

const edges: SkillEdge[] = [
  ...parentIds.map((id) => ({ id: `edge-root-${id}`, source: 'root', target: id })),
  { id: 'edge-verbal-inference', source: 'verbal', target: 'inference' }, { id: 'edge-verbal-argument', source: 'verbal', target: 'argument' },
  { id: 'edge-quant-equations', source: 'quant', target: 'equations' }, { id: 'edge-quant-data', source: 'quant', target: 'data' },
  { id: 'edge-reasoning-patterns', source: 'reasoning', target: 'patterns' }, { id: 'edge-literacy-main-idea', source: 'literacy', target: 'main-idea' }, { id: 'edge-literacy-integration', source: 'literacy', target: 'integration' },
]


const filters = ['Overall', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM']
const types = ['All Types', 'Quantitative', 'Verbal', 'Reasoning', 'Literacy']

function NodeCard({ node, selected, onClick, recommended }: { node: SkillNode; selected: boolean; onClick: () => void; recommended: boolean }) {
  const meta = statusMeta[node.status]
  const Icon = meta.icon
  return <button onClick={onClick} className={`skill-node node-${meta.color} ${node.id === 'root' ? 'root-node' : ['verbal', 'quant', 'reasoning', 'literacy'].includes(node.id) ? 'parent-node' : 'child-node'} ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`} style={{ left: node.x, top: node.y }} aria-label={node.id === 'root' ? 'View your learning profile' : `View ${node.name.replace('\n', ' ')}`}>
    {node.id === 'root' ? <><span className="root-avatar" aria-hidden="true"><img src="/profile-avatar.png" alt="" /></span><span className="node-name">Your learning profile</span></> : <><span className="node-icon"><Icon /></span><span className="node-name">{node.name.split('\n').map((line) => <span key={line}>{line}</span>)}</span></>}
    {node.progress ? <span className="node-score">{node.progress}% proficiency</span> : <span className="node-score muted-score">Not assessed</span>}
  </button>
}

export function SkillTreePage() {
  const [selected, setSelected] = useState<SkillNode | null>(null)
  const [domain, setDomain] = useState('Overall')
  const [type, setType] = useState('All Types')
  const [search, setSearch] = useState('')
  const [recommended, setRecommended] = useState(false)
  const [scale, setScale] = useState(0.78)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const graph = useMemo(() => layoutGraph(nodes, edges), [domain, type, search])
  const filteredNodes = useMemo(() => { const matches = graph.nodes.filter((node) => (!search || node.name.toLowerCase().includes(search.toLowerCase())) && (type === 'All Types' || node.type.includes(type as SkillType)) && (domain === 'Overall' || node.domains.includes(domain as UTBKDomain))); const keep = new Set(matches.map((node) => node.id)); graph.connections.forEach((edge) => { if (keep.has(edge.source) || keep.has(edge.target)) { keep.add(edge.source); keep.add(edge.target) } }); return graph.nodes.filter((node) => keep.has(node.id)) }, [graph, search, type, domain])
  const visible = new Set(filteredNodes.map((node) => node.id))

  const updateZoom = (delta: number) => setScale((value) => Math.min(1.16, Math.max(0.56, value + delta)))
  const resetView = () => { setScale(0.78); setOffset({ x: 0, y: 0 }) }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand-mark"><span>u</span><div><strong>UTBK</strong><small>JOURNEY</small></div></div><nav><NavItem icon={Home} label="Home" /><NavItem icon={Target} label="Skills" active /><NavItem icon={Zap} label="Drill" /><NavItem icon={Bot} label="AI Coach" /></nav><div className="sidebar-bottom"><NavItem icon={UserRound} label="Profile" /><p className="sidebar-caption">Keep building<br />your edge.</p></div></aside>
    <main className="page-content">
      <header className="page-header"><div><div className="eyebrow"><span className="live-dot" /> YOUR LEARNING MAP</div><h1>Skill Tree</h1><p>See what you actually know.</p></div><div className="header-actions"><button className="streak"><Flame /> 12 <span>day streak</span></button><button className="avatar">AR</button></div></header>
      <section className="toolbar"><div className="select-row"><label>DOMAIN <select value={domain} onChange={(e) => setDomain(e.target.value)}>{filters.map((filter) => <option key={filter}>{filter}</option>)}</select><ChevronDown /></label><label className="desktop-filter">TYPE <select value={type} onChange={(e) => setType(e.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown /></label><button className={`recommend-button ${recommended ? 'active' : ''}`} onClick={() => setRecommended(!recommended)}><Sparkles /> Recommended path</button></div><label className="search-box"><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills..." /><kbd>⌘ K</kbd></label></section>
      <section className="tree-section"><div className="tree-title"><div><span className="eyebrow">THE BIG PICTURE</span><h2>Explore your foundations</h2></div><div className="legend">{(['learning', 'assessed', 'needs', 'proficient', 'mastered'] as SkillStatus[]).map((status) => <span key={status}><i className={`legend-dot dot-${statusMeta[status].color}`} />{statusMeta[status].label}</span>)}</div></div>
        <div className="tree-viewport" onPointerDown={(e) => setDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y })} onPointerMove={(e) => drag && setOffset({ x: e.clientX - drag.x, y: e.clientY - drag.y })} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
          <div className="grid-fade" /><div className="tree-canvas" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
            <svg className="connections" viewBox="0 0 1200 1000" aria-hidden="true">{graph.connections.map((edge) => { const { source: from, target: to } = edge; const a = graph.nodes.find((n) => n.id === from)!; const b = graph.nodes.find((n) => n.id === to)!; const active = visible.has(from) && visible.has(to); const isParentChild = parentIds.includes(from as typeof parentIds[number]); const direction = isParentChild ? branchOrder[from as keyof typeof branchOrder] : ''; const parentRadius = 63; const childHalfW = 69; const childHalfH = 37; const rootRadius = 90; let path = ''; if (from === 'root') { const side = Math.abs(b.x - a.x) > Math.abs(b.y - a.y); if (side) { const rootEdge = a.x < b.x ? a.x + rootRadius : a.x - rootRadius; const parentEdge = b.x > a.x ? b.x - parentRadius : b.x + parentRadius; path = `M ${rootEdge} ${a.y} H ${parentEdge}`; } else { const rootEdge = a.y < b.y ? a.y + rootRadius : a.y - rootRadius; const parentEdge = b.y > a.y ? b.y - parentRadius : b.y + parentRadius; path = `M ${a.x} ${rootEdge} V ${parentEdge}`; } } else if (direction === 'up' || direction === 'down') { const isUpward = direction === 'up'; const parentEdge = a.y + (isUpward ? -parentRadius : parentRadius); const childEdge = b.y + (isUpward ? childHalfH : -childHalfH); const railY = parentEdge + (isUpward ? -46 : 46); path = `M ${a.x} ${parentEdge} V ${railY} H ${b.x} V ${childEdge}`; } else { const parentEdge = a.x + (direction === 'right' ? parentRadius : -parentRadius); const childEdge = b.x + (direction === 'right' ? -childHalfW : childHalfW); const railX = parentEdge + (direction === 'right' ? 46 : -46); path = `M ${parentEdge} ${a.y} H ${railX} V ${b.y} H ${childEdge}`; } return <path key={`${from}-${to}`} className={`${active ? 'path-active' : 'path-muted'} ${recommended && (from === 'quant' || to === 'equations') ? 'path-recommended' : ''}`} d={path} /> })}</svg>
            <div className="root-orbit" /><div className="direction direction-up"><ArrowUp /> VERBAL</div><div className="direction direction-right"><ArrowRight /> QUANTITATIVE</div><div className="direction direction-left"><ArrowLeft /> REASONING</div><div className="direction direction-down"><ArrowDown /> LITERASI</div>
            {filteredNodes.map((node) => <NodeCard key={node.id} node={node} selected={selected?.id === node.id} onClick={() => setSelected(node)} recommended={recommended && ['quant', 'equations', 'data'].includes(node.id)} />)}
          </div>
          <div className="canvas-hint"><Move /> Drag to explore</div><div className="canvas-controls"><Button variant="outline" size="icon" onClick={() => updateZoom(0.1)} aria-label="Zoom in"><Plus /></Button><span>{Math.round(scale * 100)}%</span><Button variant="outline" size="icon" onClick={() => updateZoom(-0.1)} aria-label="Zoom out"><Minus /></Button><Button variant="outline" size="icon" onClick={resetView} aria-label="Center tree"><Crosshair /></Button></div>
        </div>
      </section>
    </main>
    {selected && <DetailPanel node={selected} onClose={() => setSelected(null)} />}
    {selected && <><button className="mobile-detail-backdrop" onClick={() => setSelected(null)} aria-label="Close details" /><div className="mobile-detail"><DetailPanel node={selected} onClose={() => setSelected(null)} /></div></>}
    <nav className="mobile-nav"><NavItem icon={Home} label="Home" /><NavItem icon={Target} label="Skills" active /><NavItem icon={Zap} label="Drill" /><NavItem icon={Bot} label="AI" /><NavItem icon={UserRound} label="Profile" /></nav>
  </div>
}

function NavItem({ icon: Icon, label, active = false }: { icon: typeof Home; label: string; active?: boolean }) { return <button className={`nav-item ${active ? 'active' : ''}`} disabled={!active}><Icon /><span>{label}</span>{active && <i />}</button> }
function DetailPanel({ node, onClose }: { node: SkillNode; onClose: () => void }) { const meta = statusMeta[node.status]; const Icon = meta.icon; return <aside className="detail-panel"><button className="detail-close" onClick={onClose} aria-label="Close details"><X /></button><div className={`detail-badge badge-${meta.color}`}><Icon /> {meta.label}</div><h2>{node.name.replace('\n', ' ')}</h2><div className="detail-types">{node.type.map((item) => <span key={item}>{item}</span>)}</div><div className="metric-block"><div className="metric-label"><span>Assessment</span><strong>{node.progress ? `${node.progress}%` : 'Not taken'}</strong></div><div className="metric-track"><i style={{ width: `${node.progress || 8}%` }} /></div><small>Assessment proves mastery — practice does not.</small></div><div className="metric-block"><div className="metric-label"><span>Practice</span><strong>{node.practice.split(' · ')[0]}</strong></div><p>{node.practice.split(' · ')[1]}</p></div><div className="detail-list"><span>Used in</span><strong>{node.usedIn}</strong><span>Position</span><strong>{node.direction}</strong><span>Prerequisites</span><strong><Check /> Algebra basics</strong><strong><Check /> Number sense</strong></div><div className="detail-actions"><Button>Practice</Button><Button variant="outline">{node.status === 'needs' ? 'Retest' : 'View performance'}</Button></div></aside> }

export default SkillTreePage
