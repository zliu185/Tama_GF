import { applyAction, errorJson, okJson, resolveNow } from '../_shared';

export async function POST(request: Request) {
  try {
    const result = await applyAction('sleep', resolveNow(request));
    return okJson(result);
  } catch (error) {
    return errorJson(error);
  }
}
