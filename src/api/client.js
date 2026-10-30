export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function request(method, path, body) {
  let res
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Cannot reach the report server', 0)
  }
  const json = await res.json().catch(() => null)
  if (!json) throw new ApiError(`Server error (${res.status})`, res.status)
  if (json.code !== 0) throw new ApiError(json.message || `Request failed (${res.status})`, res.status)
  return json.data
}
