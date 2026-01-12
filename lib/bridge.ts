'server only';

import axios from 'axios';
import { ENV } from './env';
import { SearchComparablesParams } from '@/actions/comparables';
import { format, subDays } from 'date-fns';

interface FindPropertyParams {
  streetNumber: string;
  streetName: string;
  streetSuffix?: string;
  state: string;
}

export async function findProperty({
  streetNumber,
  streetName,
  streetSuffix,
  state,
}: FindPropertyParams) {
  try {
    // Search by street number, street name, and state for better matching
    // Use contains on StreetName to handle partial matches
    let filter = `StreetNumber eq '${streetNumber}' and contains(tolower(StreetName), '${streetName.toLowerCase()}') and StateOrProvince eq '${state.toUpperCase()}'`;

    // If street suffix provided, add it to filter
    if (streetSuffix) {
      filter += ` and contains(tolower(StreetSuffix), '${streetSuffix.toLowerCase()}')`;
    }

    const response = await axios.get(`${ENV.BRIDGE_ODATA_BASE_URL}/Property`, {
      params: {
        access_token: ENV.BRIDGE_ACCESS_TOKEN,
        $filter: filter,
        $orderby: 'BridgeModificationTimestamp desc',
        $top: 1,
      },
    });

    return response.data.value[0];
  } catch (err) {
    console.error('Error finding property from Bridge API', err);
    throw err;
  }
}

export async function findSaleComparables(
  searchComparables: SearchComparablesParams,
) {
  // Use latitude/longitude if available, otherwise fall back to address
  const nearValue =
    searchComparables.latitude && searchComparables.longitude
      ? `${searchComparables.longitude},${searchComparables.latitude}`
      : searchComparables.address;

  const query: Record<string, unknown> = {
    access_token: ENV.BRIDGE_ACCESS_TOKEN,
    near: nearValue,
    radius: searchComparables.maxRadius,
    sortBy: 'CloseDate',
    order: 'desc',
    limit: 30,
  };

  if (searchComparables.type === 'SALE') {
    query['HAR_PropertyType.eq'] = 'Single-Family';
  } else {
    query['HAR_PropertyType.eq'] = 'Rental';
  }

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

  try {
    const response = await axios.get(`${ENV.BRIDGE_BASE_URL}/listings`, {
      params: query,
    });

    return response.data.bundle;
  } catch (err) {
    console.error('Error finding comps from Bridge API', err);
    throw err;
  }
}
