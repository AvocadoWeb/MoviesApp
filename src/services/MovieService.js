export default class MovieService {
  _baseUrl = 'https://api.themoviedb.org/3'

  _apiKey = 'api_key=1f26b615a512c0fede8d3d45a46cf074'

  async getResource(url) {
    const res = await fetch(`${this._baseUrl}${url}`)
    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, received ${res.status}`)
    }
    return await res.json()
  }

  getPopularMovie = async (page) => {
    const res = await this.getResource(`/movie/popular?${this._apiKey}&page=${page}`)
    return res
  }

  getSearchMovie = async (query, page) => {
    const res = await this.getResource(`/search/movie?${this._apiKey}&query=${query}&page=${page}&include_adult=false`)
    return res
  }

  getGenresMovie = async () => {
    const res = await this.getResource(`/genre/movie/list?${this._apiKey}`)
    return res
  }

  createGuestSession = async () => {
    const res = await this.getResource(`/authentication/guest_session/new?${this._apiKey}`)
    return res
  }

  rateMovie = async (guestSessionId, movieId, rateValue) => {
    const rate = {
      value: rateValue,
    }
    const response = await fetch(
      `${this._baseUrl}/movie/${movieId}/rating?guest_session_id=${guestSessionId}&${this._apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(rate),
      }
    )
    return await response.json()
  }

  getRatedMovie = async (guestSessionId) => {
    const res = await this.getResource(
      `/guest_session/${guestSessionId}/rated/movies?${this._apiKey}&sort_by=created_at.asc`
    )
    return res
  }
}
