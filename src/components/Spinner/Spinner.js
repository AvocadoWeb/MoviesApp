import { Space, Spin } from 'antd'

import './Spinner.css'

const Spinner = (loading) => {
  return (
    <Space className="card__poster" style={{ display: loading ? 'flex' : 'none' }}>
      <Spin className="card__spin" size="large" />
    </Space>
  )
}

export default Spinner
