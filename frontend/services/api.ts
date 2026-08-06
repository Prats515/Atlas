const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://127.0.0.1:8000';

export async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${backendUrl}${path}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCount(path: string): Promise<number> {
  const data = await fetchJson<unknown>(path);
  if (Array.isArray(data)) {
    return data.length;
  }
  return 0;
}

export async function postJson<T>(path: string, payload: unknown): Promise<T | null> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function putJson<T>(path: string, payload: unknown): Promise<T | null> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function deleteJson(path: string): Promise<boolean> {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}
