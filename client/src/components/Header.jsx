import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Header = () => {

  const { userData } = useContext(AppContext);

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center '>
      <img src={assets.header_img} alt='headerimg' className='w-36 h-36 rounded-full nb-6'/>
        <h1 className='text-xl sm:text-3xl font-medium mb-2'>hello {userData ? userData.name : 'developer'}!</h1>
        <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our app</h2>
        <p className='mb-8'>this is the mern-auth app example</p>
        <button className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>Get Started</button>
    </div>
  )
}

export default Header
