import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!fullName || fullName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Update user metadata with full name (trigger will create profile)
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() }
    })

    if (updateError) {
      console.error('Error updating user metadata:', updateError)
    }

    // Also try to create/update profile directly as fallback
    // (Trigger should handle this, but this ensures it works)
    const serviceClient = await createServiceClient()
    await serviceClient
      .from('users')
      .upsert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName.trim(),
        role: 'customer',
      }, {
        onConflict: 'id'
      })

    return NextResponse.json({
      user: authData.user,
      message: 'Account created successfully. Please check your email to verify your account.',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

