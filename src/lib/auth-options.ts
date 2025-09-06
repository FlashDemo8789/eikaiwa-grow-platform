import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma-stub';

// Mock PrismaAdapter for MVP
const PrismaAdapter = (client: any) => ({
  createUser: async (data: any) => ({ id: 'mock-id', ...data }),
  getUser: async (id: string) => null,
  getUserByEmail: async (email: string) => null,
  getUserByAccount: async (account: any) => null,
  updateUser: async (data: any) => ({ id: 'mock-id', ...data }),
  deleteUser: async (id: string) => null,
  linkAccount: async (data: any) => data,
  unlinkAccount: async (account: any) => undefined,
  getSessionAndUser: async (sessionToken: string) => null,
  createSession: async (data: any) => data,
  updateSession: async (data: any) => data,
  deleteSession: async (sessionToken: string) => null,
  createVerificationToken: async (data: any) => data,
  useVerificationToken: async (params: any) => null,
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            organization: true,
            schools: {
              include: { school: true },
            },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};