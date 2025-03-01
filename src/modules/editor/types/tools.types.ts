export type ToolType = 'description'

export interface Tool {
  id: ToolType
  name: string
  icon: React.ComponentType
  component: React.ComponentType
}
