import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import Spinner from '../Spinner/Spinner'

import './MovieImage.css'

export default class MovieImage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
    }
  }

  isLoaded = () => {
    this.setState({
      loading: false,
    })
  }

  render() {
    const { posterPath } = this.props
    const { loading } = this.state

    const spinner = loading ? <Spinner /> : null

    const image = (
      <img
        style={{ display: !loading ? 'flex' : 'none' }}
        onLoad={this.isLoaded}
        className={`card__poster${posterPath ? ' card__poster--loaded' : ''}`}
        alt="Movie Image"
        src={
          posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg'
        }
      />
    )

    return (
      <Fragment>
        {spinner}
        {image}
      </Fragment>
    )
  }
}

MovieImage.defaultProps = {
  posterPath: null,
}

MovieImage.propTypes = {
  posterPath: PropTypes.string,
}
