export type ToolType = 'description'

export interface Tool {
  id: ToolType
  name: string
  icon: React.ComponentType
  component: React.ComponentType
}

export interface NavbarProps {
  activeTool: ToolType
  onToolSelect: (tool: ToolType) => void
}

export interface FormState {
  mainChar: string
  makers: string[]
  registeredBy: string
}
