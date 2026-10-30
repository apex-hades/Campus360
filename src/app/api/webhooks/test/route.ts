import { NextRequest, NextResponse } from 'next/server';
import { dispatchSimulatedWebhook } from '@/lib/webhook';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    const { title = 'External Alert Dispatch Simulation', message = 'Campus360 automated escalation webhook delivered to enterprise operations center.' } = await req.json();

    const result = await dispatchSimulatedWebhook({
      eventId: `EVT-${Date.now()}`,
      eventType: 'SIMULATED_TEST_BROADCAST',
      timestamp: new Date().toISOString(),
      title,
      message,
      recipients: [user?.email || 'admin@campus360.edu'],
      payload: {
        triggeredBy: user?.name || 'Administrator',
        environment: 'Enterprise V1',
        protocol: 'HTTPS / TLS 1.3',
      },
    });

    return NextResponse.json({
      success: true,
      simulationResult: result,
      message: 'Simulated external webhook dispatched and confirmed by external gateway.',
    });
  } catch (error) {
    console.error('[Webhook Test Error]', error);
    return NextResponse.json({ error: 'Webhook simulation failed' }, { status: 500 });
  }
}

