import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const Privacy: React.FC = () => {
  const { lang } = useLanguage();

  const pageTitle = lang === 'cn' ? '隐私政策 - PINTE品特烫金箔' : 'Privacy Policy - PINTE Hot Stamping Foils';
  const pageDesc = lang === 'cn'
    ? 'PINTE品特烫金箔官网隐私政策。本页说明我们如何收集、使用、存储和保护您访问网站时提供的个人信息，包括联系方式、浏览数据和Cookie使用规则。我们重视您的隐私安全，承诺不会未经许可分享您的个人信息给第三方。'
    : 'Privacy Policy for PINTE Hot Stamping Foils official website. This page explains how we collect, use, store and protect your personal information when you visit our website, including contact details, browsing data and Cookie usage. We value your privacy and promise not to share your personal information with third parties without your explicit consent.';

  return (
    <>
      <SEOMeta
        title={pageTitle}
        description={pageDesc}
        keywords={lang === 'cn' ? ['隐私政策', 'PINTE', '个人信息保护'] : ['privacy policy', 'PINTE', 'personal data protection']}
        type="website"
        locale={lang === 'cn' ? 'zh_CN' : 'en_US'}
        canonicalUrl={`/${lang}/privacy`}
        noIndex
      />

      <main className="pt-24 pb-20 bg-neutral-50 min-h-screen">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-neutral-100">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
              {lang === 'cn' ? '隐私政策' : 'Privacy Policy'}
            </h1>

            {lang === 'cn' ? (
              <div className="prose prose-lg max-w-none text-neutral-700">
                <p>
                  欢迎访问PINTE品特烫金箔官方网站。我们非常重视您的隐私，并致力于保护您的个人信息安全。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">1. 信息收集</h2>
                <p>
                  我们可能收集的信息包括：
                </p>
                <ul>
                  <li>您通过询价表单提供的联系信息（姓名、公司名称、邮箱、电话等）</li>
                  <li>网站访问数据（包括IP地址、浏览行为、设备信息等），通过Cookie和类似技术收集</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">2. 信息使用</h2>
                <p>
                  我们使用收集到的信息用于：
                </p>
                <ul>
                  <li>回复您的询价和咨询</li>
                  <li>提供产品信息和报价</li>
                  <li>改善网站内容和用户体验</li>
                  <li>遵守法律法规要求</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">3. 信息分享</h2>
                <p>
                  我们不会出售、出租或分享您的个人信息给第三方，除非：
                </p>
                <ul>
                  <li>得到您的明确同意</li>
                  <li>为了提供我们的服务所必需</li>
                  <li>法律法规要求披露</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">4. 数据安全</h2>
                <p>
                  我们采取合理的技术和组织措施保护您的个人信息免受未经授权的访问、使用或泄露。但请注意，没有任何互联网传输是完全安全的，我们无法保证绝对安全。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">5. Cookie</h2>
                <p>
                  我们使用Cookie来改善您的浏览体验。您可以在浏览器设置中禁用Cookie，但这可能会影响某些网站功能。
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">6. 联系方式</h2>
                <p>
                  如果您对本隐私政策有任何问题，请通过以下方式联系我们：
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
                  Welcome to the official website of PINTE Hot Stamping Foils. We value your privacy and are committed to protecting your personal information.
                  This Privacy Policy explains how we collect, use, store, and protect your personal data.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">1. Information We Collect</h2>
                <p>
                  We may collect the following information:
                </p>
                <ul>
                  <li>Contact information you provide through our quote request form (name, company name, email, phone, etc.)</li>
                  <li>Website usage data (including IP address, browsing behavior, device information) collected through cookies and similar technologies</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">2. How We Use Your Information</h2>
                <p>
                  We use the collected information for:
                </p>
                <ul>
                  <li>Responding to your inquiries and quote requests</li>
                  <li>Providing product information and quotations</li>
                  <li>Improving website content and user experience</li>
                  <li>Complying with legal and regulatory requirements</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">3. Information Sharing</h2>
                <p>
                  We do not sell, rent, or share your personal information to third parties unless:
                </p>
                <ul>
                  <li>We have your explicit consent</li>
                  <li>It is necessary for providing our services</li>
                  <li>Disclosure is required by law</li>
                </ul>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">4. Data Security</h2>
                <p>
                  We take reasonable technical and organizational measures to protect your personal information against unauthorized access, use, or disclosure.
                  However, no method of transmission over the Internet is completely secure, and we cannot guarantee absolute security.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">5. Cookies</h2>
                <p>
                  We use cookies to improve your browsing experience. You can disable cookies in your browser settings,
                  but this may affect some website functionality.
                </p>

                <h2 className="text-2xl font-bold text-neutral-900 mt-8 mb-4">6. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;
