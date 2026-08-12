import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from './prisma';
import { requireEnv } from './env';

let _authOptions: NextAuthOptions | undefined;

function createAuthOptions(): NextAuthOptions {
  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      GoogleProvider({
        clientId: requireEnv('GOOGLE_CLIENT_ID'),
        clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/auth/signin',
    },
    callbacks: {
      session({ session, token }) {
        session.user.id = token.sub ?? '';
        return session;
      },
    },
  };
}

function getAuthOptions(): NextAuthOptions {
  if (!_authOptions) {
    _authOptions = createAuthOptions();
  }
  return _authOptions;
}

export const authOptions: NextAuthOptions = new Proxy({} as NextAuthOptions, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuthOptions(), prop, receiver);
  },
});
