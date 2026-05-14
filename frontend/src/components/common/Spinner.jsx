import React from 'react'

const Spinner = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'h-screen' : 'h-48'}`}>
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

export default Spinner
