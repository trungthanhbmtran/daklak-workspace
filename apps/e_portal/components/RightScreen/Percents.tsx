import React from 'react'
import BoxCard from '../BoxContent'

function Percents() {
    return (
        <BoxCard title="Thống kê hồ sơ"  >
            <iframe
                src="https://dichvucong.daklak.gov.vn/vi/iframe/dossier-iframe-report?macoquan=64f7f4ca6a6796068ebfe0d1&gidzl=INJ-7Or9n4LFO_aPZLJCHKrZy1wNLiaJ03JsJirMp1rTDlL2dGARJrvYeXUR0vWPLZxsGsNq10nhZqd7GG"
                width="100%"
                height="230px"
                style={{ border: 'none' }}
            ></iframe>
        </BoxCard>
    )
}

export default Percents