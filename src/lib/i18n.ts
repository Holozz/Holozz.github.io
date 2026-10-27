export type Lang = 'zh' | 'en';
const zh = {
  home: '首页', articles: '文章', notes: '笔记', photos: '相册', projects: '项目',
  about: '关于', archives: '归档', categories: '分类', tags: '标签',
  tagline: '笔记、文章与沿途所见', homeDescription: '记录学习，保存思考，收藏日常。',
  articlesDescription: '写下值得展开的思考。', notesDescription: '把学习中的理解与发现留在这里。',
  photosDescription: '用照片留住日常的片刻。', projectsDescription: 'GitHub 上的置顶项目。',
  aboutDescription: '很高兴在这里遇见你。', archivesDescription: '沿着时间，回看所有记录。',
  categoriesDescription: '按主题浏览文章与笔记。', tagsDescription: '从一个关键词开始探索。',
  latest: '最新记录', recent: '近期文章', links: '站外链接', explore: '随处看看',
  emptyTitle: '这里还没有内容', emptyDescription: '新的记录发布后，会出现在这里。',
  emptyArticles: '文章发布后，会按时间显示在这里。', emptyNotes: '笔记发布后，会按时间显示在这里。',
  emptyPhotos: '第一本相册发布后，会出现在这里。', emptyTaxonomy: '发布带有分类或标签的内容后，这里会自动整理。',
  noRecent: '暂无文章或笔记', noCategories: '暂无分类', noTags: '暂无标签',
  allContent: '全部记录', read: '阅读全文', viewAll: '查看全部',
  github: 'GitHub 主页', githubVisit: '访问 GitHub', backHome: '返回首页',
  menu: '打开导航', navigation: '主导航', language: '切换语言', skip: '跳到正文',
  original: '阅读原文', originalLanguage: '原文语言', translationMissing: '这篇内容暂时没有中文译文。',
  contents: '文章目录', published: '发布于', updated: '更新于', previous: '上一篇', next: '下一篇',
  copy: '复制代码', copied: '已复制', copyFailed: '复制失败，请手动选择代码',
  photoClose: '关闭大图', photoPrevious: '上一张照片', photoNext: '下一张照片', photoOpen: '查看大图',
  photoCount: '张照片', fork: '派生仓库', pinned: '置顶项目', noProjectDescription: '在 GitHub 查看源码与详情。',
  profile: '个人资料', location: '所在地', bio: '简介', siteDescription: '用于分享笔记、文章与照片的个人空间。',
  notFound: '页面未找到', notFoundDescription: '这个地址可能已经更改，或页面尚未发布。',
  siteName: 'Holozz 的个人空间', originalZh: '中文原文', originalEn: '英文原文',
  postsCount: '记录', albumsCount: '相册', footer: '记录与分享', translationNotice: '当前展示原文，尚无此语言译文。',
};
const en: Record<keyof typeof zh, string> = {
  home: 'Home', articles: 'Articles', notes: 'Notes', photos: 'Photos', projects: 'Projects',
  about: 'About', archives: 'Archives', categories: 'Categories', tags: 'Tags',
  tagline: 'Notes, stories & moments', homeDescription: 'A place for learning, thinking, and everyday moments.',
  articlesDescription: 'Thoughts with a little room to grow.', notesDescription: 'Things learned, understood, and worth keeping.',
  photosDescription: 'Everyday moments, kept in photographs.', projectsDescription: 'Pinned repositories on GitHub.',
  aboutDescription: 'Glad you found your way here.', archivesDescription: 'All the records, along a timeline.',
  categoriesDescription: 'Browse articles and notes by subject.', tagsDescription: 'Follow a keyword to something interesting.',
  latest: 'Latest entries', recent: 'Recent entries', links: 'Elsewhere', explore: 'Explore',
  emptyTitle: 'Nothing here yet', emptyDescription: 'New entries will appear here when published.',
  emptyArticles: 'Published articles will appear here, newest first.', emptyNotes: 'Published notes will appear here, newest first.',
  emptyPhotos: 'The first album will appear here when published.', emptyTaxonomy: 'Categories and tags will appear as entries are published.',
  noRecent: 'No entries yet', noCategories: 'No categories yet', noTags: 'No tags yet',
  allContent: 'All entries', read: 'Read more', viewAll: 'View all',
  github: 'GitHub profile', githubVisit: 'Visit GitHub', backHome: 'Back to home',
  menu: 'Toggle navigation', navigation: 'Main navigation', language: 'Switch language', skip: 'Skip to content',
  original: 'Read original', originalLanguage: 'Original language', translationMissing: 'An English translation is not available for this entry.',
  contents: 'On this page', published: 'Published', updated: 'Updated', previous: 'Previous entry', next: 'Next entry',
  copy: 'Copy code', copied: 'Copied', copyFailed: 'Could not copy; please select the code manually',
  photoClose: 'Close photo', photoPrevious: 'Previous photo', photoNext: 'Next photo', photoOpen: 'View photo',
  photoCount: 'photos', fork: 'Fork', pinned: 'Pinned repositories', noProjectDescription: 'View source and details on GitHub.',
  profile: 'Profile', location: 'Location', bio: 'Bio', siteDescription: 'A personal space for notes, articles, and photographs.',
  notFound: 'Page not found', notFoundDescription: 'The address may have changed, or the page has not been published.',
  siteName: 'Holozz’s personal space', originalZh: 'Chinese original', originalEn: 'English original',
  postsCount: 'entries', albumsCount: 'albums', footer: 'Notes & moments', translationNotice: 'Showing the original; a translation is not available.',
};
export const messages = { zh, en };
export const sections = ['home', 'articles', 'notes', 'photos', 'projects', 'about'] as const;
export const allSections = [...sections, 'archives', 'categories', 'tags'] as const;
export type Section = typeof allSections[number];
export function href(lang: Lang, path = '') { return (lang === 'en' ? '/en/' : '/') + path.replace(/^\/+|\/+$/g, '') + (path ? '/' : ''); }
export function formatDate(date: Date, lang: Lang) { return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date); }
