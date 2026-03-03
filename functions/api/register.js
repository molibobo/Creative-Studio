// 注册 API: POST /api/register
const ITERATIONS = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders })
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  )
  return Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context
    const { email, password } = await request.json()

    if (!email || !password || password.length < 6) {
      return Response.json(
        { ok: false, error: '邮箱和密码不能为空，密码至少 6 位' },
        { status: 400, headers: corsHeaders }
      )
    }

    const DB = env.DB
    if (!DB) {
      return Response.json(
        { ok: false, error: '数据库未配置' },
        { status: 500, headers: corsHeaders }
      )
    }

    // 检查邮箱是否已存在
    const existing = await DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first()

    if (existing) {
      return Response.json(
        { ok: false, error: '该邮箱已被注册' },
        { status: 409, headers: corsHeaders }
      )
    }

    // 生成盐并哈希密码
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
    const hash = await hashPassword(password, salt)
    const passwordHash = `${saltHex}:${hash}`

    await DB.prepare(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)'
    ).bind(email.toLowerCase(), passwordHash).run()

    return Response.json({ ok: true, message: '注册成功' }, { headers: corsHeaders })
  } catch (e) {
    console.error('Register error:', e)
    return Response.json(
      { ok: false, error: '注册失败，请稍后重试' },
      { status: 500, headers: corsHeaders }
    )
  }
}
