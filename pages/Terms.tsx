import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const Terms: React.FC = () => {
  const { lang } = useLanguage();

  const pageTitle = lang === 'cn' ? '服务条款 - PINTE品特烫金箔' : 'Terms of Service - PINTE Hot Stamping Foils';
  const pageDesc = lang === 'cn'
    ? 'PINTE品特烫金箔官网使用服务条款。本页说明您访问和使用本网站需要遵守的条件，包括知识产权归属、产品信息免责声明、报价订单规则、责任限制和适用法律等内容。'
    : 'Terms of Service for PINTE Hot Stamping Foils official website. This page outlines the terms and conditions you agree to when accessing and using this website, including intellectual property rights, product information disclaimers, quotation and ordering rules, limitation of liability, and governing law.';

  return (
    <>
      <SEOMeta
        title={pageTitle}
        description={pageDesc}
        keywords={lang === 'cn' ? ['服务条款', 'PINTE', '使用条件'] : ['terms of service', 'PINTE', 'conditions of use']}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/terms`}
        noIndex
      />

      <main className="pt-24 pb-20 bg-neutral-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              {lang === 'cn' ? '服务条款' : 'Terms of Service'}
            </h1>

            {lang === 'cn' ? (
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  欢迎访问PINTE品特烫金箔官方网站。使用本网站即表示您同意遵守以下服务条款。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">1. 使用许可</h2>
                <p>
                  PINTE授予您非排他性、不可转让、不可再许可的权限来访问和使用本网站，仅用于合法的商业目的。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">2. 知识产权</h2>
                <p>
                  本网站上的所有内容（包括文字、图片、设计、商标、产品信息等）均由PINTE或其权利人所有，受著作权法和其他知识产权法律保护。未经书面许可，不得复制、分发、修改或使用任何内容。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">3. 产品信息</h2>
                <p>
                  我们努力确保网站上的产品信息准确，但不保证产品描述或其他内容完全准确、完整、可靠或最新。产品规格可能会有所改进，如有更改恕不另行通知。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">4. 报价与订单</h2>
                <p>
                  网站上提供的报价仅供参考，最终价格以我们书面确认的报价为准。订单确认以我们的接受为准。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">5. 免责声明</h2>
                <p>
                  本网站按"原样"提供，不提供任何明示或暗示的保证。我们不保证网站不间断运行或无错误，也不保证结果准确。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">6. 责任限制</h2>
                <p>
                  在任何情况下，PINTE均不对因使用本网站产生的任何损害承担责任，包括利润损失或其他间接损失。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">7. 适用法律</h2>
                <p>
                  本条款受中华人民共和国法律管辖。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">8. 修改</h2>
                <p>
                  我们可能不时更新这些条款，修改后的条款在发布后生效。继续使用网站即表示您接受修改后的条款。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">9. 联系方式</h2>
                <p>
                  如果您对这些条款有任何问题，请通过以下方式联系我们：
                  <br />
                  邮箱：<a href="mailto:sales9@bestglitter.com" className="text-pinte-blue hover:underline">sales9@bestglitter.com</a>
                </p>

                <p className="text-sm text-neutral-500 mt-8">
                  最后更新：2026年4月
                </p>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  Welcome to the official website of PINTE Hot Stamping Foils. By accessing this website, you agree to be bound by these Terms of Service.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">1. License to Use</h2>
                <p>
                  PINTE grants you a non-exclusive, non-transferable, non-sublicensable license to access and use this website
                  for legitimate business purposes only.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">2. Intellectual Property</h2>
                <p>
                  All content on this website (including text, images, designs, trademarks, product information, etc.)
                  is owned by PINTE or its licensors and is protected by copyright and other intellectual property laws.
                  You may not copy, distribute, modify, or use any content without prior written permission.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">3. Product Information</h2>
                <p>
                  We strive to ensure product information on this website is accurate, but we do not warrant that product
                  descriptions or other content is completely accurate, complete, reliable, or current. Product specifications
                  are subject to improvement without notice.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">4. Quotations and Orders</h2>
                <p>
                  Quotations provided on this website are for reference only. Final prices are as confirmed in writing by us.
                  Orders are confirmed upon acceptance by us.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">5. Disclaimers</h2>
                <p>
                  This website is provided on an "as is" basis. We make no warranties, expressed or implied,
                  regarding the operation of the website or the accuracy of information.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">6. Limitation of Liability</h2>
                <p>
                  In no event shall PINTE be liable for any damages resulting from the use of this website,
                  including loss of profits or other indirect damages.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">7. Governing Law</h2>
                <p>
                  These terms are governed by the laws of the People's Republic of China.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">8. Changes to Terms</h2>
                <p>
                  We may update these terms from time to time. Revised terms are effective upon posting.
                  Your continued use of the website constitutes acceptance of the revised terms.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">9. Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                  <br />
                  Email: <a href="mailto:sales9@bestglitter.com" className="text-pinte-blue hover:underline">sales9@bestglitter.com</a>
                </p>

                <p className="text-sm text-neutral-500 mt-8">
                  Last updated: April 2026
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Terms;
