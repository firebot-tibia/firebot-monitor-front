import axios from 'axios';

export const refreshAccessToken = async (session: any) => {
  try {
    console.log('Refreshing access token...');
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {}, {
      headers: {
        'x-refresh-token': session?.refresh_token,
      },
    });
    console.log('Session:', response.data);
    return response.data;
  } catch (error) {
    console.log('Failed to refresh access token:', error);
  }
};