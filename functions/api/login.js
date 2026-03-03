// 登录 API: POST /api/login
const ITERATIONS = 100000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders })
}

async function hashPassword(password, saltBytes) {
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
      salt: saltBytes,
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

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json(
        { ok: false, error: '请输入邮箱和密码' },
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

    const user = await DB.prepare(
      'SELECT id, password_hash FROM users WHERE email = ?'
    ).bind(email.toLowerCase()).first()

    if (!user) {
      return Response.json(
        { ok: false, error: '邮箱或密码错误' },
        { status: 401, headers: corsHeaders }
      )
    }

    const [saltHex, storedHash] = user.password_hash.split(':')
    if (!saltHex || !storedHash) {
      return Response.json(
        { ok: false, error: '账户数据异常' },
        { status: 500, headers: corsHeaders }
      )
    }

    const saltBytes = hexToBytes(saltHex)
    const hash = await hashPassword(password, saltBytes)

    if (hash !== storedHash) {
      return Response.json(
        { ok: false, error: '邮箱或密码错误' },
        { status: 401, headers: corsHeaders }
      )
    }

    return Response.json({
      ok: true,
      message: '登录成功',
      user: { id: user.id, email: email.toLowerCase() }
    }, { headers: corsHeaders })
  } catch (e) {
    console.error('Login error:', e)
    return Response.json(
      { ok: false, error: '登录失败，请稍后重试' },
      { status: 500, headers: corsHeaders }
    )
  }
}
