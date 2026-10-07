import { createTokenHandlers } from '@/presentation/http/handlers';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export const { POST } = createTokenHandlers(container);
