"use client";

import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface UseAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = 'https://accounts.sparkchat.shivraj-kolekar.in/sign-up', requireAuth = false } = options
  const { user, isLoaded } = useUser()
  const clerk = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && isLoaded && !user) {
      router.push(redirectTo)
    }
  }, [requireAuth, isLoaded, user, redirectTo, router])

  const signOut = async () => {
    try {
      await clerk.signOut()
      router.push('https://accounts.sparkchat.shivraj-kolekar.in/sign-up')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    signOut,
  }
}

export default useAuth
