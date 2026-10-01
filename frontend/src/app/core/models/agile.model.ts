export type UserRole =
  | 'PRODUCT_OWNER'
  | 'SCRUM_MASTER'
  | 'INVENTORY_MANAGER'
  | 'WAREHOUSE_STAFF'
  | 'PURCHASING_OFFICER'
  | 'SALES_AGENT';

export interface User {
  id?: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
}

export interface SprintEpic {
  id: number;
  epicNumber: number;
  epicTitle: string;
  sprintNumber: number;
  sprintName: string;
  roleOwner: UserRole;
  storyPoints: number;
  status: string;
  deliverablesSummary: string;
}

export interface RoleResponsibility {
  title: string;
  responsibilities: string[];
}

export type AgileRolesMap = Record<string, RoleResponsibility>;
