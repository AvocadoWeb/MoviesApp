import React, { Component, Fragment } from 'react'
import { Input, Tabs, Modal, Spin, Space } from 'antd'
import _debounce from 'lodash/debounce'
import { Offline, Online } from 'react-detect-offline'

import MovieService from '../../services/MovieService'
import MovieList from '../MovieList'
import GenresContext from '../../services/GenresContext'
import ErrorIndicator from '../ErrorIndicator'
import './App.css'

export default class App extends Component {
  movieService = new MovieService()

  constructor(props) {
    super(props)
    this.state = {
      searchMovie: null,
      fetchSearchMovie: null,
      movieList: null,
      totalResults: null,
      loading: false,
      error: null,
      currentPage: 1,
      currentTab: 'search',
      guestSessionId: null,
      genresList: null,
      ratedMovies: new Map(),
    }
    this.inputRef = React.createRef()
  }

  componentDidMount() {
    this.createGuestSession()
    this.getGenresList()
    this.getMovies()
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentTab, currentPage, fetchSearchMovie } = this.state
    if (prevState.fetchSearchMovie !== fetchSearchMovie) {
      this.setState({
        currentPage: 1,
      })
      this.getMovies()
    }
    if (prevState.currentTab !== currentTab) {
      this.setState({
        currentPage: 1,
      })
      if (currentTab === 'search') {
        this.getMovies()
      } else {
        this.getRatedMovies()
      }
    }
    if (prevState.currentPage !== currentPage) {
      if (currentTab === 'search') {
        this.getMovies()
      } else {
        this.getRatedMovies()
      }
    }
  }

  movieDebounce = _debounce(() => {
    const { searchMovie } = this.state
    this.setState({
      fetchSearchMovie: searchMovie,
    })
  }, 1000)

  onChangeSearch = (evt) => {
    this.setState({
      searchMovie: evt.target.value,
    })
    this.movieDebounce()
  }

  onSubmitSearch = (evt) => {
    evt.preventDefault()
  }

  onChangePage = (page) => {
    this.setState({
      currentPage: page,
    })
  }

  onChangeTab = (tab) => {
    this.setState({
      currentTab: tab,
    })
  }

  onChangeRate = (rate, id) => {
    const { guestSessionId } = this.state
    this.movieService
      .rateMovie(guestSessionId, id, rate)
      .then(() => {
        this.setState(({ ratedMovies }) => ({
          ratedMovies: new Map(ratedMovies.set(id, rate)),
        }))
        localStorage.setItem(id, rate)
      })
      .catch((err) => {
        this.onError(err)
      })
  }

  onError = (err) => {
    this.setState({
      error: err.message,
      loading: false,
    })
  }

  getMovieList(list) {
    this.setState({
      loading: true,
    })
    try {
      list()
        .then((list) => {
          this.setState({
            movieList: list.results,
            totalResults: list.total_results,
            loading: false,
          })
        })
        .catch((err) => {
          this.onError(err)
        })
    } catch (err) {
      this.onError(err)
    }
  }

  getMovies = () => {
    const { fetchSearchMovie, currentPage } = this.state
    const { getSearchMovie, getPopularMovie } = this.movieService
    if (fetchSearchMovie) {
      this.getMovieList(() => getSearchMovie(fetchSearchMovie, currentPage))
    } else {
      this.getMovieList(() => getPopularMovie(currentPage))
    }
  }

  getRatedMovies() {
    const { guestSessionId, currentPage } = this.state
    const { getRatedMovie } = this.movieService
    this.getMovieList(() => getRatedMovie(guestSessionId, currentPage))
  }

  createGuestSession() {
    if (Date.parse(localStorage.getItem('expires_at')) < Date.now() || !localStorage.getItem('expires_at')) {
      try {
        this.movieService
          .createGuestSession()
          .then((result) => {
            this.setState({
              guestSessionId: result.guest_session_id,
            })
            localStorage.clear()
            localStorage.setItem('success', result.success)
            localStorage.setItem('guest_session_id', result.guest_session_id)
            localStorage.setItem('expires_at', result.expires_at)
          })
          .catch((err) => {
            this.onError(err)
          })
      } catch (err) {
        this.onError(err)
      }
    } else {
      this.setState({
        guestSessionId: localStorage.getItem('guest_session_id'),
      })
    }
  }

  getGenresList() {
    this.movieService.getGenresMovie().then(({ genres }) => {
      this.setState({
        genresList: genres,
      })
    })
  }

  render() {
    const {
      movieList,
      guestSessionId,
      genresList,
      searchMovie,
      fetchSearchMovie,
      totalResults,
      currentPage,
      ratedMovies,
      loading,
      error,
    } = this.state

    const hasData = !(loading || error)

    const errorIndicator = error ? <ErrorIndicator text={error} /> : null

    const spinner = loading ? (
      <Space size="middle">
        <Spin tip="Loading" size="large" style={{ padding: 20 }} />
      </Space>
    ) : null

    const content = hasData ? (
      <MovieList
        movieList={movieList}
        fetchSearchMovie={fetchSearchMovie}
        currentPage={currentPage}
        onChangePage={this.onChangePage}
        onChangeRate={this.onChangeRate}
        totalResults={totalResults}
        guestSessionId={guestSessionId}
        ratedMovies={ratedMovies}
      />
    ) : null

    const items = [
      {
        label: 'Search',
        key: 'search',
        children: (
          <div className="wrapper">
            <form onSubmit={this.onSubmitSearch}>
              <Input
                placeholder="Type to search..."
                value={searchMovie}
                onChange={this.onChangeSearch}
                ref={this.inputRef}
              />
            </form>
            {errorIndicator}
            {spinner}
            {content}
          </div>
        ),
      },
      {
        label: 'Rated',
        key: 'rated',
        children: (
          <div className="wrapper">
            {errorIndicator}
            {spinner}
            {content}
          </div>
        ),
      },
    ]

    const networkError = (err) => {
      Modal.destroyAll()
      if (!err) {
        Modal.error({
          title: 'No internet connection',
          content: 'No internet connection',
        })
      } else {
        Modal.success({
          content: 'Successfull connection',
        })
      }
    }

    const polling = {
      enabled: true,
      url: 'www.themoviedb.org/',
    }

    return (
      <Fragment>
        <Online polling={polling}>
          <GenresContext.Provider value={genresList}>
            <div className="App">
              <Tabs items={items} centered onChange={this.onChangeTab} />
            </div>
          </GenresContext.Provider>
        </Online>
        <Offline polling={polling} onChange={networkError} />
      </Fragment>
    )
  }
}
