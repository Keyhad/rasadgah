import { createKpiHandlers } from '@/presentation/http/handlers';
import { container } from '@/server/container';

export const dynamic = 'force-dynamic';

export const { GET, PUT } = createKpiHandlers(container);
