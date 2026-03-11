import { errorJson, getCurrentPetState, okJson, resolveNow } from '../_shared';

export async function GET(request: Request) {
  try {
    const result = await getCurrentPetState(resolveNow(request));
    return okJson(result);
  } catch (error) {
    return errorJson(error);
  }
}
