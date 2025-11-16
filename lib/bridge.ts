'server only';

import axios from 'axios';
import { ENV } from './env';
import { SearchComparablesParams } from '@/actions/comparables';
import { format, subDays } from 'date-fns';

export async function findProperty(address: string) {
  try {
    const response = await axios.get(`${ENV.BRIDGE_ODATA_BASE_URL}/Property`, {
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

export async function findSaleComparables(
  searchComparables: SearchComparablesParams
) {
  const query: any = {
    access_token: ENV.BRIDGE_ACCESS_TOKEN,
    near: searchComparables.address,
    radius: searchComparables.maxRadius,
    sortBy: 'CloseDate',
    order: 'desc',
    limit: 30,
    'HAR_PropertyType.eq': 'Single-Family',
  };

  const cutoffDate = subDays(new Date(), searchComparables.daysOld ?? 365);
  const formattedDate = format(cutoffDate, 'yyyy-MM-dd');
  query['CloseDate.gte'] = formattedDate;

  if (searchComparables.minBaths) {
    query['BathroomsTotalDecimal.gte'] = searchComparables.minBaths;
  }
  if (searchComparables.maxBaths) {
    query['BathroomsTotalDecimal.lte'] = searchComparables.maxBaths;
  }
  if (searchComparables.minBeds) {
    query['BedroomsTotal.gte'] = searchComparables.minBeds;
  }
  if (searchComparables.maxBeds) {
    query['BedroomsTotal.lte'] = searchComparables.maxBeds;
  }
  if (searchComparables.minSquareFootage) {
    query['LivingArea.gte'] = searchComparables.minSquareFootage;
  }
  if (searchComparables.maxSquareFootage) {
    query['LivingArea.lte'] = searchComparables.maxSquareFootage;
  }

  console.log('COMPARABLES QUERY:', query);

  try {
    const response = await axios.get(`${ENV.BRIDGE_BASE_URL}/listings`, {
      params: query,
    });

    console.log('COMPARABLES SIZE:', response.data.total);

    return response.data.bundle;
  } catch (err) {
    console.error('Error finding sales comps from Bridge API', err);
    throw err;
  }
}
