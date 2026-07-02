export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export class GeocodeError extends Error {}

const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY as string | undefined;

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!GOONG_API_KEY) {
    throw new GeocodeError(
      'Thiếu VITE_GOONG_API_KEY trong .env — vui lòng cấu hình API key Goong.',
    );
  }

  const trimmed = address.trim();
  if (!trimmed) {
    throw new GeocodeError('Vui lòng nhập địa chỉ trước khi tìm vị trí.');
  }

  let res: Response;
  try {
    res = await fetch(
      `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(trimmed)}&api_key=${GOONG_API_KEY}`,
    );
  } catch {
    throw new GeocodeError(
      'Không thể kết nối tới dịch vụ định vị. Vui lòng thử lại.',
    );
  }

  if (!res.ok) {
    throw new GeocodeError(
      `Goong API trả lỗi (status ${res.status}). Vui lòng thử lại sau.`,
    );
  }

  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw new GeocodeError(
      'Không tìm thấy vị trí phù hợp với địa chỉ này. Vui lòng kiểm tra lại hoặc chọn trực tiếp trên bản đồ.',
    );
  }

  const top = data.results[0];
  const { lat, lng } = top.geometry.location;

  return {
    lat,
    lng,
    formattedAddress: top.formatted_address ?? trimmed,
  };
}
