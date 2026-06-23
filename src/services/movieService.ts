import axios from 'axios';
import type { MoviesHttpResponse } from '../types/movie';

const tmdbToken = `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`;

export async function fetchMovies(
  search: string,
  page: number = 1
): Promise<MoviesHttpResponse> {
  const parameters = {
    params: {
      query: search,
      page: page,
    },
    headers: {
      Authorization: tmdbToken,
      accept: 'application/json',
    },
  };
  const response = await axios.get<MoviesHttpResponse>(
    'https://api.themoviedb.org/3/search/movie',
    parameters
  );

  return response.data;
}
