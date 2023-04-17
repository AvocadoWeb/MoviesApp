import { Component, Fragment } from 'react'
import { Pagination, Space, Spin } from 'antd'
import PropTypes from 'prop-types'

import MovieCard from '../MovieCard'
import './MovieList.css'

export default class MovieList extends Component {
  renderList = () => {
    const { movieList, onChangeRate, ratedMovies } = this.props

    if (!movieList) {
      return (
        <Space size="middle">
          <Spin size="large" />
        </Space>
      )
    }

    return movieList.map((movie) => (
      <MovieCard
        key={movie.id}
        movie={movie}
        id={movie.id}
        onChangeRate={(rate) => onChangeRate(rate, movie.id)}
        rating={Number(movie.rating || ratedMovies.get(movie.id) || localStorage.getItem(movie.id) || 0)}
      />
    ))
  }

  render() {
    const { totalResults, onChangePage, currentPage } = this.props

    return (
      <Fragment>
        <ul className="movie-list">{this.renderList()}</ul>
        <Pagination
          className="pagination"
          current={currentPage}
          onChange={onChangePage}
          pageSize={20}
          showSizeChanger={false}
          total={totalResults > 10000 ? 10000 : totalResults}
        />
      </Fragment>
    )
  }
}

MovieList.defaultProps = {
  movieList: null,
  totalResults: 0,
}

MovieList.propTypes = {
  movieList: PropTypes.arrayOf(PropTypes.shape({})),
  totalResults: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  onChangeRate: PropTypes.func.isRequired,
  onChangePage: PropTypes.func.isRequired,
  ratedMovies: PropTypes.any.isRequired,
}
