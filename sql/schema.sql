-- sql/schema.sql
-- Cloudflare D1 Schema for Bilingual Content

-- Content table: stores all translatable strings
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'zh')),
  section TEXT NOT NULL,
  key_path TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(locale, section, key_path)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_content_lookup 
ON content(locale, section, key_path);

-- ─────────────────────────────────────────────────────────────
-- ENGLISH CONTENT (locale = 'en')
-- ─────────────────────────────────────────────────────────────

-- Navigation
INSERT OR REPLACE INTO content (locale, section, key_path, value) VALUES
  ('en', 'nav', 'home', 'Home'),
  ('en', 'nav', 'about', 'About'),
  ('en', 'nav', 'services', 'Services'),
  ('en', 'nav', 'works', 'Works'),
  ('en', 'nav', 'team', 'Team'),
  ('en', 'nav', 'contact', 'Contact'),

  -- Hero Section
  ('en', 'hero', 'tagline', 'Increase your sales'),
  ('en', 'hero', 'titleStart', 'Grow your'),
  ('en', 'hero', 'titleHighlight', 'digital business'),
  ('en', 'hero', 'titleMiddle', 'with us & make'),
  ('en', 'hero', 'titleEnd', 'Success'),
  ('en', 'hero', 'cta', 'Get Start a Project'),
  ('en', 'hero', 'teamCard.title', 'The most experienced team we have for you.'),
  ('en', 'hero', 'trust.text', 'Trusted by 50,000+ teams to communicate easily'),
  ('en', 'hero', 'heroImage', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('en', 'hero', 'stats.servicesTitle', 'Services Offered'),
  ('en', 'hero', 'stats.servicesBadge', '6+'),
  ('en', 'hero', 'stats.revenueTitle', 'Annual Revenue'),
  ('en', 'hero', 'stats.revenueValue', '25,4780'),
  ('en', 'hero', 'stats.revenueGrowth', '↑ +25M $'),
  ('en', 'hero', 'stats.helped', 'Clients helped'),
  ('en', 'hero', 'stats.helpedValue', '12K+'),

  -- About Section
  ('en', 'about', 'badge', 'About Us'),
  ('en', 'about', 'title', 'Who We Are'),
  ('en', 'about', 'subtitle', 'We are a team of passionate creators, developers, and strategists dedicated to building digital experiences that matter.'),
  ('en', 'about', 'heading', 'We blend creativity with data to help your business grow exponentially.'),
  ('en', 'about', 'description', 'At GoSarwar, we believe that great design is more than just aesthetics. It''s about solving problems, connecting with audiences, and delivering measurable results.'),
  ('en', 'about', 'aboutImage', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('en', 'about', 'features.strategy.title', 'Creative Strategy'),
  ('en', 'about', 'features.strategy.desc', 'Innovative approaches to stand out in the market.'),
  ('en', 'about', 'features.growth.title', 'Data Driven'),
  ('en', 'about', 'features.growth.desc', 'Decisions backed by analytics and real user insights.'),
  ('en', 'about', 'features.team.title', 'Expert Team'),
  ('en', 'about', 'features.team.desc', 'Skilled professionals passionate about technology.'),
  ('en', 'about', 'features.secure.title', 'Secure & Reliable'),
  ('en', 'about', 'features.secure.desc', 'Robust solutions you can trust with your data.'),

  -- Services Section
  ('en', 'services', 'title', 'Business Services'),
  ('en', 'services', 'subtitle', 'We provide a wide range of digital services to help your business grow.'),
  ('en', 'services', 'items.seo.title', 'SEO Optimization'),
  ('en', 'services', 'items.seo.desc', 'Improve your search rankings and drive organic traffic.'),
  ('en', 'services', 'items.design.title', 'UI/UX Design'),
  ('en', 'services', 'items.design.desc', 'Beautiful interfaces designed for maximum user engagement.'),
  ('en', 'services', 'items.marketing.title', 'Digital Marketing'),
  ('en', 'services', 'items.marketing.desc', 'Strategic campaigns that convert visitors into customers.'),
  ('en', 'services', 'items.ecommerce.title', 'E-Commerce'),
  ('en', 'services', 'items.ecommerce.desc', 'Robust online stores built to maximize sales.'),
  ('en', 'services', 'items.analytics.title', 'Analytics'),
  ('en', 'services', 'items.analytics.desc', 'Data-driven insights to help you make better decisions.'),
  ('en', 'services', 'items.support.title', '24/7 Support'),
  ('en', 'services', 'items.support.desc', 'Dedicated team ready to help you whenever you need.'),

  -- Team Section
  ('en', 'team', 'title', 'Meet Our Team'),
  ('en', 'team', 'subtitle', 'We are a group of passionate individuals working together.'),
  ('en', 'team', 'members.CEO', 'Alex Johnson'),
  ('en', 'team', 'members.CTO', 'Sarah Lee'),
  ('en', 'team', 'members.Designer', 'Mike Chen'),
  ('en', 'team', 'members.DevLead', 'David Kim'),

  -- Footer Section
  ('en', 'footer', 'title', 'Contact Us'),
  ('en', 'footer', 'subtitle', 'We''d love to hear from you'),
  ('en', 'footer', 'phone', '+1 234 567 890'),
  ('en', 'footer', 'whatsapp', 'https://wa.me/1234567890'),
  ('en', 'footer', 'email', 'info@gosarwar.com'),
  ('en', 'footer', 'youtube', 'https://youtube.com/channel/UC123456');

-- ─────────────────────────────────────────────────────────────
-- CHINESE CONTENT (locale = 'zh')
-- ─────────────────────────────────────────────────────────────

-- Navigation
INSERT OR REPLACE INTO content (locale, section, key_path, value) VALUES
  ('zh', 'nav', 'home', '首页'),
  ('zh', 'nav', 'about', '关于我们'),
  ('zh', 'nav', 'services', '服务'),
  ('zh', 'nav', 'works', '作品'),
  ('zh', 'nav', 'team', '团队'),
  ('zh', 'nav', 'contact', '联系'),

  -- Hero Section
  ('zh', 'hero', 'tagline', '提升您的销售额'),
  ('zh', 'hero', 'titleStart', '与我们一起发展'),
  ('zh', 'hero', 'titleHighlight', '数字业务'),
  ('zh', 'hero', 'titleMiddle', '共创'),
  ('zh', 'hero', 'titleEnd', '成功'),
  ('zh', 'hero', 'cta', '开始项目'),
  ('zh', 'hero', 'teamCard.title', '我们为您提供经验最丰富的团队。'),
  ('zh', 'hero', 'trust.text', '全球50,000+团队信赖的沟通平台'),
  ('zh', 'hero', 'heroImage', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('zh', 'hero', 'stats.servicesTitle', '提供的服务'),
  ('zh', 'hero', 'stats.servicesBadge', '6+'),
  ('zh', 'hero', 'stats.revenueTitle', '年收入'),
  ('zh', 'hero', 'stats.revenueValue', '254,780'),
  ('zh', 'hero', 'stats.revenueGrowth', '↑ +2500万 $'),
  ('zh', 'hero', 'stats.helped', '服务客户'),
  ('zh', 'hero', 'stats.helpedValue', '1.2万+'),

  -- About Section
  ('zh', 'about', 'badge', '关于我们'),
  ('zh', 'about', 'title', '我们是谁'),
  ('zh', 'about', 'subtitle', '我们是一支充满激情的创作者、开发者和策略师团队，致力于打造有意义的数字体验。'),
  ('zh', 'about', 'heading', '我们将创意与数据相结合，帮助您的业务实现指数级增长。'),
  ('zh', 'about', 'description', '在GoSarwar，我们相信优秀的设计不仅仅是美学。它是关于解决问题、与受众建立联系并交付可衡量的成果。'),
  ('zh', 'about', 'aboutImage', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('zh', 'about', 'features.strategy.title', '创意策略'),
  ('zh', 'about', 'features.strategy.desc', '创新方法帮助您在市场中脱颖而出。'),
  ('zh', 'about', 'features.growth.title', '数据驱动'),
  ('zh', 'about', 'features.growth.desc', '基于分析和真实用户洞察的决策。'),
  ('zh', 'about', 'features.team.title', '专业团队'),
  ('zh', 'about', 'features.team.desc', '对技术充满热情的熟练专业人士。'),
  ('zh', 'about', 'features.secure.title', '安全可靠'),
  ('zh', 'about', 'features.secure.desc', '您可以放心托付数据的稳健解决方案。'),

  -- Services Section
  ('zh', 'services', 'title', '企业服务'),
  ('zh', 'services', 'subtitle', '我们提供广泛的数字服务，助力您的业务增长。'),
  ('zh', 'services', 'items.seo.title', 'SEO优化'),
  ('zh', 'services', 'items.seo.desc', '提升搜索排名，驱动自然流量。'),
  ('zh', 'services', 'items.design.title', 'UI/UX设计'),
  ('zh', 'services', 'items.design.desc', '为最大化用户参与度而设计的美观界面。'),
  ('zh', 'services', 'items.marketing.title', '数字营销'),
  ('zh', 'services', 'items.marketing.desc', '将访客转化为客户的战略性营销活动。'),
  ('zh', 'services', 'items.ecommerce.title', '电子商务'),
  ('zh', 'services', 'items.ecommerce.desc', '为最大化销售而构建的稳健在线商店。'),
  ('zh', 'services', 'items.analytics.title', '数据分析'),
  ('zh', 'services', 'items.analytics.desc', '数据驱动的洞察，助您做出更明智的决策。'),
  ('zh', 'services', 'items.support.title', '全天候支持'),
  ('zh', 'services', 'items.support.desc', '专属团队随时为您提供帮助。'),

  -- Team Section
  ('zh', 'team', 'title', '认识我们的团队'),
  ('zh', 'team', 'subtitle', '我们是一群充满激情的个人，共同努力。'),
  ('zh', 'team', 'members.CEO', '王经理'),
  ('zh', 'team', 'members.CTO', '李技术'),
  ('zh', 'team', 'members.Designer', '陈设计'),
  ('zh', 'team', 'members.DevLead', '刘开发'),

  -- Footer Section
  ('zh', 'footer', 'title', '联系我们'),
  ('zh', 'footer', 'subtitle', '我们很乐意收到您的来信'),
  ('zh', 'footer', 'phone', '+86 138 0000 0000'),
  ('zh', 'footer', 'whatsapp', 'https://wa.me/8613800000000'),
  ('zh', 'footer', 'email', 'cn@gosarwar.com'),
  ('zh', 'footer', 'youtube', 'https://youtube.com/channel/UC123456');