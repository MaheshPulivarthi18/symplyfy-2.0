import React from 'react'
import { Button } from './ui/button'

const Home = () => {
  return (
    <div className='flex flex-col items-center'>
        <a href="/">Home</a>
        <a className=' p-4 border-1 bg-gray-400 w-40 rounded-full mt-4 hover:bg-gray-200' href="/schedule">Go to Schedule</a>
        {/* <Button className="mt-4">Click me!</Button> */}
    </div>
    
  )
}

export default Home