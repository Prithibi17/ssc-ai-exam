import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const workerBaseUrl = process.env.PYTHON_WORKER_URL;

    if (!workerBaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'PYTHON_WORKER_URL is not configured. Internal service binding is inactive in this environment.',
        },
        { status: 503 }
      );
    }

    // Call internal python_worker service via the injected binding URL
    const targetUrl = new URL('/extract', workerBaseUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { success: false, error: `Python worker returned status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal ingestion error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const workerBaseUrl = process.env.PYTHON_WORKER_URL;
  if (!workerBaseUrl) {
    return NextResponse.json({
      status: 'unbound',
      message: 'PYTHON_WORKER_URL is not set.',
    });
  }

  try {
    const targetUrl = new URL('/health', workerBaseUrl);
    const res = await fetch(targetUrl);
    const data = await res.json();
    return NextResponse.json({
      status: 'connected',
      worker: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unreachable',
      error: error?.message,
    });
  }
}
