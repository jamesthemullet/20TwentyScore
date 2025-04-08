// pages/api/auth/[...nextauth].ts

import { NextApiHandler } from 'next';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import GoogleProvider from 'next-auth/providers/google';
import prisma from '../../../lib/prisma';

const authHandler: NextApiHandler = (req, res) => {
  const options = {
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_ID || '',
        clientSecret: process.env.GITHUB_SECRET || ''
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_ID || '',
        clientSecret: process.env.FACEBOOK_SECRET || ''
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID || '',
        clientSecret: process.env.GOOGLE_SECRET || ''
      })
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.SECRET
  };
  NextAuth(req, res, options);
};

export default authHandler;
