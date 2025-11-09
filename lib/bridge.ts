'server only';

import axios from 'axios';
import { ENV } from './env';

export async function findProperty(address: string) {
  try {
    const response = await axios.get(`${ENV.BRIDGE_BASE_URL}/listings`, {
      params: {
        access_token: ENV.BRIDGE_ACCESS_TOKEN,
        near: address,
        radius: 0.0000000001,
        limit: 1,
      },
    });

    return response.data.bundle[0];
  } catch (err) {
    console.error('Error finding property from Bridge API', err);
    throw err;
  }
}
