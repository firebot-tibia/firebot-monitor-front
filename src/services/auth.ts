import axios from 'axios';

export const refreshAccessToken = async (session: any) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {}, {
      headers: {
        'x-refresh-token': session.refresh_token,
      },
    });

    const { access_token, refresh_token } = response.data;

    return {
      ...session,
      access_token,
      refresh_token,
      error: null,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...session,
      error: 'RefreshAccessTokenError',
    };
  }
};