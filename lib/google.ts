'use server';

import axios from 'axios';
import { ENV } from './env';

interface AutocompleteResponse {
  suggestions: [
    {
      placePrediction: {
        placeId: string;
        place: string;
        text: {
          text: string;
        };
      };
    },
  ];
}

export async function autocomplete(input: string) {
  try {
    const response = await axios.post<AutocompleteResponse>(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        input,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': ENV.GOOGLE_API_KEY,
        },
      },
    );

    return response.data.suggestions.map((suggestion) => ({
      value: suggestion.placePrediction?.placeId ?? '',
      label: suggestion.placePrediction?.text?.text ?? '',
    }));
  } catch (err) {
    console.error('Error fetching autocomplete places from Google', err);
    return [];
  }
}

export async function getPlaceDetails(placeId: string) {
  try {
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': ENV.GOOGLE_API_KEY,
          'X-Goog-FieldMask': '*',
        },
      },
    );
    console.log('PLACE DETAILS:', response.data.addressComponents);
    const { addressComponents } = response.data;

    let streetNumber = '';
    let street = '';
    let unitNumber: string | undefined;
    let city = '';
    let state = '';
    let postalCode = '';

    addressComponents.forEach((comp: any) => {
      const types: string[] = comp.types;
      if (types.includes('street_number')) {
        streetNumber = comp.longText;
      } else if (types.includes('route')) {
        street = comp.longText;
      } else if (types.includes('subpremise')) {
        unitNumber = comp.longText;
      } else if (types.includes('locality')) {
        city = comp.longText;
      } else if (types.includes('administrative_area_level_1')) {
        state = comp.shortName;
      } else if (types.includes('postal_code')) {
        postalCode = comp.longText;
      }
    });

    let address = `${streetNumber} ${street}`;
    if (unitNumber) {
      address += ` ${unitNumber}`;
    }

    return {
      address,
      city,
      state,
      postalCode,
    };
  } catch (err) {
    console.error('Error fetching place details from Google', err);
    throw err;
  }
}

autocomplete('17375 Merigold');
