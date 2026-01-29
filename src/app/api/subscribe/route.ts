import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!AUDIENCE_ID) {
      // Fallback if no audience ID is set: just email the admin or log it. 
      // Ideally, this should add to a Resend Audience.
      // For now, we will try to add to the 'General' audience if one exists, or create a contact.
      console.warn('RESEND_AUDIENCE_ID is not defined in .env')
      // If you are just using Resend for transactional, you might not have an audience set up yet.
      // We'll proceed assuming the user will set this up.
    }

    try {
        await resend.contacts.create({
            email: email,
            firstName: '',
            lastName: '',
            unsubscribed: false,
            audienceId: AUDIENCE_ID || '' // This will fail if empty, handled by catch
        })
    } catch (e) {
        console.error("Failed to add contact to audience", e)
        // If audience interaction fails, we might still want to return success to the user 
        // if we are just logging it, but better to fail if we strictly need the list.
        // For this implementation, I'll return an error if we can't save the contact.
        return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
