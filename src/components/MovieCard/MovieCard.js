import { Component, Fragment } from 'react'
import { Tag, Rate, Typography } from 'antd'
import PropTypes from 'prop-types'

import RateCircle from '../RateCircle'
import ErrorIndicator from '../ErrorIndicator'
import MovieImage from '../MovieImage'
import GenresContext from '../../services/GenresContext'
import Spinner from '../Spinner'
import './MovieCard.css'

const { Paragraph } = Typography

export default class MovieCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      error: false,
    }
  }

  renderGenres = (genresArr, genres) => {
    if (genres && genresArr) {
      return genres.map((genreId) => {
        const genreObj = genresArr.find(({ id }) => id === genreId)

        return <Tag key={genreObj.id}>{genreObj.name}</Tag>
      })
    }
    return null
  }

  render() {
    const { loading, error } = this.state
    const { movie, rating, onChangeRate } = this.props
    const {
      title,
      release_date: releaseDate,
      poster_path: posterPath,
      genre_ids: genres,
      vote_average: voteAverage,
      overview,
    } = movie

    const hasData = !(loading || error)
    const errorIndicator = error ? <ErrorIndicator text="Movie did not load" /> : null
    const spinner = loading ? <Spinner /> : null

    const content = hasData ? (
      <Fragment>
        <MovieImage posterPath={posterPath} />
        <div className="card__header">
          <span className="card__title">
            <span className="card__title-text">{title}</span>
            <RateCircle percent={voteAverage} />
          </span>
          <span className="card__date">{releaseDate}</span>
          <GenresContext.Consumer>
            {(genresArr) => <div className="card__genres">{this.renderGenres(genresArr, genres)}</div>}
          </GenresContext.Consumer>
        </div>
        <div className="card__description">
          <Paragraph ellipsis={{ rows: 4, expandable: false, symbol: '...' }}>{String(overview)}</Paragraph>
          <Rate className="card__rate" count={10} value={rating} onChange={onChangeRate} />
        </div>
      </Fragment>
    ) : null

    return (
      <div className="card">
        {errorIndicator}
        {spinner}
        {content}
      </div>
    )
  }
}

MovieCard.contextType = GenresContext

MovieCard.defaultProps = {
  rating: 0,
}

MovieCard.propTypes = {
  movie: PropTypes.shape({
    title: PropTypes.string.isRequired,
    release_date: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    genre_ids: PropTypes.arrayOf(PropTypes.number).isRequired,
    vote_average: PropTypes.number.isRequired,
    overview: PropTypes.string,
  }).isRequired,
  onChangeRate: PropTypes.func.isRequired,
  rating: PropTypes.number,
}
