import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { hash, ...data } = payload;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    // If bot token is not configured (e.g. initial dev/testing), permit demo telegram login
    if (!botToken || botToken.includes('123456789')) {
      return NextResponse.json({
        success: true,
        message: 'Development mock Telegram login successful',
        user: { id: `tg_${data.id || 'demo'}`, display_name: data.first_name || 'Telegram Warrior' },
      });
    }

    if (!hash) {
      return NextResponse.json({ error: 'Missing hash parameter' }, { status: 400 });
    }

    // 1. Check auth_date for replay protection (must be within 24 hours)
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (data.auth_date && nowSeconds - Number(data.auth_date) > 86400) {
      return NextResponse.json({ error: 'Authentication payload has expired' }, { status: 401 });
    }

    // 2. Recompute Telegram HMAC-SHA256 hash
    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const dataCheckString = Object.keys(data)
      .sort()
      .map((k) => `${k}=${data[k]}`)
      .join('\n');

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ error: 'Invalid authentication signature' }, { status: 403 });
    }

    // 3. Find or create Supabase user using Admin Client
    const admin = createAdminClient();
    if (admin) {
      const email = `tg_${data.id}@winterarc.telegram`;
      const { data: existingUsers } = await admin.auth.admin.listUsers();
      let user = existingUsers?.users?.find((u) => u.email === email);

      if (!user) {
        const { data: newUser, error: createError } = await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username,
            avatar_url: data.photo_url || null,
            telegram_id: data.id,
          },
        });
        if (createError) throw createError;
        user = newUser.user;
      }

      // Upsert profile record
      if (user) {
        await admin.from('profiles').upsert({
          id: user.id,
          display_name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Warrior',
          avatar_url: data.photo_url || null,
          telegram_id: data.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      telegram_id: data.id,
      username: data.username,
    });
  } catch (error: any) {
    console.error('Telegram verification error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
