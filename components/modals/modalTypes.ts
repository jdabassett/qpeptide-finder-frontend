export type ModalType = 
  | 'login'
  | 'new-digest'
  | 'digests'
  | 'analysis'
  | 'directions'
  | 'science'
  | null;

export interface ModalConfig {
  title: string;
  component: React.ComponentType;
}