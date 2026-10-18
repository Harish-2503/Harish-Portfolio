export const layerBg = {
  design: 'bg-layer-design',
  interface: 'bg-layer-interface',
  logic: 'bg-layer-logic',
  data: 'bg-layer-data',
}
export const layerName = { design: 'Design', interface: 'Interface', logic: 'Logic', data: 'Data' }

// Top to bottom, as the stack is drawn: surface first, data last.
export const layerOrder = ['design', 'interface', 'logic', 'data']
export const layerVar = {
  design: 'var(--color-layer-design)',
  interface: 'var(--color-layer-interface)',
  logic: 'var(--color-layer-logic)',
  data: 'var(--color-layer-data)',
}

// Text colour that stays readable on each layer's fill.
export const layerInk = {
  design: 'var(--color-ink)',
  interface: 'var(--color-cream)',
  logic: 'var(--color-ink)',
  data: 'var(--color-cream)',
}
