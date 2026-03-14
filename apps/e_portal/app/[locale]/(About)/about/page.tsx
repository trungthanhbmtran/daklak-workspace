import React from 'react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  // Lấy namespace 'AboutPage' từ file JSON
  const t = useTranslations('AboutPage');

  return (
    <section className="p-4 md:p-8 space-y-6 text-justify">
      {/* TIÊU ĐỀ CHÍNH */}
      <h2 className="text-2xl font-bold text-center mb-6 text-primary">
        {t('title')}
      </h2>

      {/* ĐIỀU 1 */}
      <div>
        <h3 className="text-xl font-semibold mb-3">{t('article1.title')}</h3>
        <div className="space-y-3">
          {/* Sử dụng t.rich để render thẻ <b> trong JSON */}
          <p>
            {t.rich('article1.content1', {
              b: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <p>
            {t.rich('article1.content2', {
              b: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
        </div>
      </div>

      {/* ĐIỀU 2 */}
      <div>
        <h3 className="text-xl font-semibold mb-4">{t('article2.title')}</h3>

        {/* Mục 1 */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">{t('article2.section1.title')}</h4>
          <ul className="list-none pl-2 space-y-1">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k'].map((key) => (
              <li key={key} className="pl-4">
                {t(`article2.section1.list.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Mục 2 */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">{t('article2.section2.title')}</h4>
          <ul className="list-none pl-2 space-y-1">
            {['a', 'b'].map((key) => (
               <li key={key} className="pl-4">
                 {t(`article2.section2.list.${key}`)}
               </li>
            ))}
          </ul>
        </div>

        {/* Mục 3 */}
        <div className="mb-4">
          <h4 className="font-bold mb-1">{t('article2.section3.title')}</h4>
          <p>{t('article2.section3.content')}</p>
        </div>

        {/* Mục 4 */}
        <div className="mb-4">
          <h4 className="font-bold mb-1">{t('article2.section4.title')}</h4>
          <p>{t('article2.section4.content')}</p>
        </div>

        {/* Mục 5 */}
        <div className="mb-4">
          <h4 className="font-bold mb-2">{t('article2.section5.title')}</h4>
          <ul className="list-none pl-2 space-y-1">
             {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm'].map((key) => (
              <li key={key} className="pl-4">
                {t(`article2.section5.list.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* Các mục còn lại (6-10) */}
        <div className="space-y-4">
          <h4 className="font-bold">{t('article2.section6.title')}</h4>
          <h4 className="font-bold">{t('article2.section7.title')}</h4>
          <h4 className="font-bold">{t('article2.section8.title')}</h4>
          <h4 className="font-bold">{t('article2.section9.title')}</h4>
          <h4 className="font-bold">{t('article2.section10.title')}</h4>
        </div>
      </div>
    </section>
  );
}