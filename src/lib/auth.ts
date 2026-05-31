import 'server-only';

import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

const AUTH_COOKIE = 'mindshore-auth-token';
const SEVEN_DAYS = 60 * 60 * 24 * 7;

type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string | null;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return new TextEncoder().encode(secret);
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SEVEN_DAYS,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createAuthToken(payload: AuthTokenPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SEVEN_DAYS}s`)
    .sign(getJwtSecret());
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (!payload.sub || typeof payload.email !== 'string') {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : null,
  };
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE, token, getCookieOptions());
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, '', { ...getCookieOptions(), maxAge: 0 });
}

export async function getCurrentUser() {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;

  const auth = await verifyAuthToken(token);
  if (!auth) return null;

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return user;
}
