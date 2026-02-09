import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://predictionmarketanalytics.io';

// Lazy-load Resend to avoid build errors when API key is not set
async function sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('DEV MODE - Verification URL:', verifyUrl);
    return true;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Prediction Market Analytics <noreply@predictionmarketanalytics.io>',
      to,
      subject: 'Start your 7-day free trial - Prediction Market Analytics API',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937;">Welcome to Prediction Market Analytics</h1>
          <p style="color: #4b5563; font-size: 16px;">
            Hi ${name},
          </p>
          <p style="color: #4b5563; font-size: 16px;">
            Click the button below to verify your email and start your 7-day free trial:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Start Free Trial
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link expires in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

/**
 * POST /api/developer/register
 * Initiate API key registration with email verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already has an active API key
    const existingKeys = await db
      .collection('api-keys')
      .where('email', '==', normalizedEmail)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!existingKeys.empty) {
      return NextResponse.json(
        {
          error: 'Email already registered',
          message: 'This email already has an API key. Check your email for the original key or contact support.'
        },
        { status: 409 }
      );
    }

    // Generate verification token
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store pending registration
    await db.collection('pending-registrations').doc(token).set({
      email: normalizedEmail,
      name: name.trim(),
      token,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      verified: false,
    });

    // Send verification email - link to API route which handles verification and redirects
    const verifyUrl = `${BASE_URL}/api/developer/verify?token=${token}`;
    await sendVerificationEmail(normalizedEmail, name.trim(), verifyUrl);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Developer registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', message: 'Please try again later' },
      { status: 500 }
    );
  }
}
