export interface Item {
  id: number;
  remote_id: number;
  shopping_list_id: number;
  product_name: string;
  unit_name: string;
  creator_email: string;
  amount: number;
  done: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}
