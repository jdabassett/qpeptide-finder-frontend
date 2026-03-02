export type ModalType = 
  | 'login'
  | 'logout'
  | 'new-digest'
  | 'digests'
  | 'review'
  | 'directions'
  | 'science'
  | null;

export interface ModalConfig {
  title: string;
  component: React.ComponentType;
}