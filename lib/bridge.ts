'server only';

import axios from 'axios';
import { ENV } from './env';
import { Address } from './types';

export async function findProperty(address: Address) {
  const { streetNumber, streetName, streetSuffix, city, state, postalCode } =
    address;

  const near = `${streetNumber} ${streetName} ${streetSuffix}, ${city}, ${state} ${postalCode}`;

  try {
    const response = await axios.get(`${ENV.BRIDGE_BASE_URL}/listings`, {
      params: {
        access_token: ENV.BRIDGE_ACCESS_TOKEN,
        near,
        radius: 0.000001,
        limit: 5,
      },
    });

    return response.data.bundle.find((property: any) => {
      return property;
    });
    return response.data.bundle[0];
  } catch (err) {
    console.error('Error finding property from Bridge API', err);
    throw err;
  }
}
