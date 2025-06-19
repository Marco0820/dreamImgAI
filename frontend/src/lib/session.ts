import prisma from './prisma';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// 创建匿名会话
export async function createAnonymousSession() {
  const sessionId = `anon_${uuidv4()}`;
  await prisma.anonymousSession.create({
    data: { id: sessionId }
  });
  return sessionId;
}

// 获取当前用户/会话
export async function getCurrentEntity(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    return { type: 'user', id: session.user.id };
  }
  
  const anonSessionId = req.cookies.get('anonSession')?.value;
  if (anonSessionId) {
     // 验证匿名会话ID是否存在于数据库
     const anonSession = await prisma.anonymousSession.findUnique({
      where: { id: anonSessionId },
    });
    if (anonSession) {
      return { type: 'anonymous', id: anonSessionId };
    }
  }
  
  return null;
} 