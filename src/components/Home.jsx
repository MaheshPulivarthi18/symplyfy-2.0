import React from 'react'

const Home = () => {
  return (
    <div className='flex flex-col items-center'>
        <a href="/">Home</a>
        <a className=' p-4 border-1 bg-gray-400 w-40 rounded-full mt-4 hover:bg-gray-200' href="/schedule">Go to Schedule</a>
    </div>
    
  )
}

export default Home