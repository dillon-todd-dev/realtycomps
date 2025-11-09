import axios from 'axios';
import { ENV } from '@/lib/env';

type PlacePrediction = {
  place: string;
  placeId: string;
  text: {
    text: string;
    matches: {
      offset: number;
    }[];
  };
};

type AutocompleteSuggestions = {
  suggestions: {
    placePrediction: PlacePrediction;
  }[];
};

type AutocompleteResponse = {
  value: string;
  label: string;
};

type AddressComponent = {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
};

type PlaceDetails = {
  addressComponents: AddressComponent[];
};

type PlaceDetailsResponse = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

type StreetViewImageResponse = string;

export const getAutocompleteSuggestions = async (
  searchInput: string
): Promise<AutocompleteResponse[] | null> => {
  const url = 'https://places.googleapis.com/v1/places:autocomplete';
  const primaryTypes = [
    'street_address',
    'subpremise',
    'route',
    'street_number',
    'landmark',
  ];

  console.warn('autocomplete url', url);
  console.warn('autocomplete input', searchInput);

  try {
    const { data }: { data: AutocompleteSuggestions } = await axios.post(
      url,
      {
        input: searchInput,
        includedPrimaryTypes: primaryTypes,
        includedRegionCodes: ['us'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': ENV.NEXT_PUBLIC_GOOGLE_API_KEY,
        },
      }
    );
    if (data.suggestions.length === 0) return null;

    return data.suggestions.map((suggestion) => {
      return {
        value: suggestion.placePrediction.placeId,
        label: suggestion.placePrediction.text.text,
      };
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('Message:', error.message);
      console.error('Status Code:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      console.error('Request Config:', error.config);
    } else {
      console.error('Failed to get autocomplete suggestions:', error);
    }
    return null;
  }
};

export const getPlaceDetails = async (
  placeId: string
): Promise<PlaceDetailsResponse | null> => {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const { data }: { data: PlaceDetails } = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': ENV.NEXT_PUBLIC_GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'addressComponents,photos',
        'Content-Type': 'application/json',
      },
    });

    const findAddressPart = (str: string) => {
      const addressPart = data.addressComponents.find(
        (addressComponent: AddressComponent) => {
          if (addressComponent.types.includes(str)) {
            return addressComponent;
          }
        }
      );

      return addressPart?.longText ?? '';
    };

    const streetNumber = findAddressPart('street_number');
    const streetName = findAddressPart('route');
    const city = findAddressPart('locality');
    const state = findAddressPart('administrative_area_level_1');
    const postalCode = findAddressPart('postal_code');

    return {
      street: `${streetNumber} ${streetName}`,
      city,
      state,
      postalCode,
    };
  } catch (error) {
    console.error('Failed to get place details:', error);
    return null;
  }
};

export const getStreetViewImage = async (
  address: string
): Promise<StreetViewImageResponse | null> => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/streetview?location=${encodedAddress}&size=600x600&key=${ENV.NEXT_PUBLIC_GOOGLE_API_KEY}`;

  try {
    const { data }: { data: string } = await axios.get(url, {
      headers: {
        'X-Goog-Api-Key': ENV.NEXT_PUBLIC_GOOGLE_API_KEY,
      },
    });

    console.log(typeof data);

    return data;
  } catch (error) {
    console.error('Failed to get street view image:', error);
    return null;
  }
};
