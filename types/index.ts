export interface User {
  id: number
  username: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Friendship {
  id: number
  user_id: number
  friend_id: number
  status: "pending" | "accepted" | "blocked"
  friend?: User
}

export interface Wallet {
  id: number
  user_id: number
  balance: number
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: number
  amount: number
  type: "deposit" | "withdraw" | "game_win" | "game_loss" | "farm_harvest"
  source: string
  created_at: string
}

export interface PlantModel {
  id: number
  name: string
  growth_time: number
  harvest_value: number
  seed_cost: number
  image_url?: string
}

export interface FarmSlot {
  id: number
  user_id: number
  slot_x: number
  slot_y: number
  plant_model_id?: number
  planted_at?: string
  harvest_ready_at?: string
  is_harvested: boolean
  plant?: PlantModel
}

export interface CaroStats {
  id: number
  user_id: number
  games_played: number
  games_won: number
  level: number
  total_earnings: number
}

export interface CaroRoom {
  id: number
  room_code: string
  player1_id: number
  player2_id?: number
  bet_amount: number
  status: "waiting" | "playing" | "finished"
  winner_id?: number
  board_state?: string
  current_turn?: number
  player1?: User
  player2?: User
}

export interface ChatMessage {
  id: number
  sender_id: number
  receiver_id: number
  message: string
  is_read: boolean
  created_at: string
  sender?: User
}

export interface CaroRoomMessage {
  id: number
  room_id: number
  user_id: number
  message: string
  created_at: string
  user?: User
}
