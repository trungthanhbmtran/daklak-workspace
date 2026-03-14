import React from 'react'
import MenuLeft from './MenuLeft'
import BannerLeft from './BannerLeft'
import LibaryVideo from './LibaryVideo'
import LibaryImage from './LibaryImage'
// import Navigation from './Navigation'

function LeftScreen() {
  return (
    <aside className='w-64 flex-shrink-0 flex flex-col gap-4'>
        <MenuLeft/>
        <LibaryVideo/>
        <BannerLeft/>
        {/* <LibaryImage/> */}
        {/* <Navigation/> */}
    </aside>
  )
}

export default LeftScreen