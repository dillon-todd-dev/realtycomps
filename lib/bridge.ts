'server only';

import axios from 'axios';
import { ENV } from './env';

export async function findProperty(address: string) {
  try {
    const response = await axios.get(`${ENV.BRIDGE_BASE_URL}/Property`, {
      params: {
        access_token: ENV.BRIDGE_ACCESS_TOKEN,
        $filter: `tolower(UnparsedAddress) eq '${address.toLowerCase()}'`,
      },
    });

    return response.data.value[0];
  } catch (err) {
    console.error('Error finding property from Bridge API', err);
    throw err;
  }
}
