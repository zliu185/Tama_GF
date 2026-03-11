import { errorJson, getEasterEggMessage, okJson } from '../_shared';

export async function GET() {
  try {
    const message = await getEasterEggMessage();
    return okJson({ message });
  } catch (error) {
    return errorJson(error);
  }
}
