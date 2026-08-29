const fs = require('fs');

const files = [
  'apps/web/app/(marketing)/page.tsx',
  'apps/web/app/experience/page.tsx',
  'apps/web/app/privacy/page.tsx',
  'apps/web/app/about/page.tsx'
];

files.forEach(f => {
  const fullPath = 'D:/AgnesRepo/mail-mind-assistant/' + f;
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace hardcoded nav items with translation keys
  content = content.replace(
    /<li><Link href="\/experience">Experience<\/Link><\/li>/g,
    `<li><Link href="/experience">{t('nav.experience')}</Link></li>`
  );
  
  content = content.replace(
    /<li><Link href="\/about">关于作者<\/Link><\/li>/g,
    `<li><Link href="/about">{t('nav.about')}</Link></li>`
  );
  
  content = content.replace(
    /<li><Link href="\/privacy">Privacy<\/Link><\/li>/g,
    `<li><Link href="/privacy">{t('nav.privacy')}</Link></li>`
  );
  
  content = content.replace(
    /<li><a href="https:\/\/github.com\/GavinCnod\/mail-mind-assistant" target="_blank" rel="noreferrer">GitHub<\/a><\/li>/g,
    `<li><a href="https://github.com/GavinCnod/mail-mind-assistant" target="_blank" rel="noreferrer">{t('nav.github')}</a></li>`
  );
  
  fs.writeFileSync(fullPath, content);
  console.log('Updated: ' + f);
});

console.log('Done!');
