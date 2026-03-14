import React from 'react'
import Geographic from './Geographic'
import BannerNavigation from './BannerNavigation'
import AccessInformation from './AccessInformation'
import Percents from './Percents'
import NotificationScreen from './NotificationScreen'


function RightScreen() {
  return (
    <aside className='w-80 flex-shrink-0 flex flex-col gap-4'>
      <NotificationScreen/>
      <Geographic />
      <BannerNavigation />
      <Percents />
      <AccessInformation />
    </aside>
  )
}

export default RightScreen