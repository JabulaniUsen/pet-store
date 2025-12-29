import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Find existing item with same product ID, size, and color
        const existingItem = get().items.find((i) => 
          i.id === item.id && 
          i.size === (item.size || undefined) &&
          i.color === (item.color || undefined)
        )
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id && 
              i.size === (item.size || undefined) &&
              i.color === (item.color || undefined)
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          })
        } else {
          set({
            items: [...get().items, { ...item, quantity: item.quantity || 1 }],
          })
        }
      },
      removeItem: (id, size, color) => {
        set({
          items: get().items.filter((i) => 
            i.id !== id || 
            (size !== undefined && i.size !== size) ||
            (color !== undefined && i.color !== color)
          ),
        })
      },
      updateQuantity: (id, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(id, size, color)
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id && 
              (size === undefined || i.size === size) &&
              (color === undefined || i.color === color)
                ? { ...i, quantity }
                : i
            ),
          })
        }
      },
      clearCart: () => {
        set({ items: [] })
      },
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'petspace-cart',
    }
  )
)

