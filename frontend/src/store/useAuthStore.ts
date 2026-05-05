import { create } from 'zustand'

interface User {
  name: string
  email: string
  pin: string
  avatar: string
}

interface AuthStore {
  isAuthenticated: boolean
  currentUser: User | null
  users: User[]
  login: (email: string, pin: string) => { success: boolean; message: string }
  register: (name: string, email: string, pin: string) => { success: boolean; message: string }
  logout: () => void
  _loadFromStorage: () => void
}

const STORAGE_KEY = 'sentiq_users'
const SESSION_KEY = 'sentiq_session'

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  users: [],

  _loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const users: User[] = stored ? JSON.parse(stored) : []
      const session = localStorage.getItem(SESSION_KEY)
      const currentUser = session ? JSON.parse(session) : null
      set({
        users,
        currentUser,
        isAuthenticated: !!currentUser,
      })
    } catch {
      set({ users: [], currentUser: null, isAuthenticated: false })
    }
  },

  login: (email: string, pin: string) => {
    const { users } = get()
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.pin === pin
    )
    if (!user) {
      return { success: false, message: 'Incorrect email or PIN. Please try again.' }
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    set({ isAuthenticated: true, currentUser: user })
    return { success: true, message: 'Welcome back!' }
  },

  register: (name: string, email: string, pin: string) => {
    const { users } = get()
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'This email is already registered. Please log in.' }
    }
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const newUser: User = { name, email, pin, avatar: initials }
    const updated = [...users, newUser]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
    set({ users: updated, isAuthenticated: true, currentUser: newUser })
    return { success: true, message: 'Account created!' }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ isAuthenticated: false, currentUser: null })
  },
}))
