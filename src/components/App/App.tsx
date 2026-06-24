import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import css from './App.module.css';
import { Toaster, toast } from 'react-hot-toast';
import type { Movie } from '../../types/movie';
import { fetchMovies } from '../../services/movieService';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import ReactPaginateModule from 'react-paginate';
import type { ReactPaginateProps } from 'react-paginate';
import type { ComponentType } from 'react';

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<
    ComponentType<ReactPaginateProps>
  >
).default;

function App() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [query, setquery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const closeModal = () => {
    setMovie(null);
  };

  const handleSearch = async (search: string) => {
    setquery(search);
    setPage(1);
  };

  const handleFetch = async (search: string, page: number) => {
    const data = await fetchMovies(search, page);
    const movies: Movie[] = [];
    const processedData = data;
    if (data.results.length > 0) {
      for (const movie of data.results) {
        const movieCopy: Movie = structuredClone(movie);
        movieCopy.poster_path = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        movieCopy.backdrop_path = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        movies.push(movieCopy);
      }
    }
    processedData.results = movies;
    return processedData;
  };

  const handleClick = (movie: Movie) => {
    setMovie(movie);
  };

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['movie', query, page],
    queryFn: () => handleFetch(query, page),
    enabled: query !== '',
    placeholderData: keepPreviousData,
  });

  const totalPages = data?.total_pages ?? 0;

  useEffect(() => {
    if (isSuccess === true && data.results.length === 0) {
      toast('No movies found for your request.');
    }
  }, [isSuccess, data]);

  return (
    <div className={css.App}>
      <SearchBar onSubmit={handleSearch} />
      {totalPages > 1 && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {isLoading === true && <Loader />}
      {isError === true && <ErrorMessage />}
      {data !== null && data !== undefined && data.results !== null && (
        <MovieGrid onSelect={handleClick} movies={data.results} />
      )}
      {movie !== null && <MovieModal movie={movie} onClose={closeModal} />}
      <Toaster />
    </div>
  );
}

export default App;
