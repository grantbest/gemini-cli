import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    appEnv: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    devUrl: process.env.NEXT_PUBLIC_DEV_URL || 'http://localhost:3000',
    prodUrl: process.env.NEXT_PUBLIC_PROD_URL || 'https://prod.dosomething.inc',
  });
}
