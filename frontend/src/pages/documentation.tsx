import { type NextPage, GetStaticProps } from "next";
import Layout from "@/components/Layout";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Code, 
  Database, 
  Palette, 
  Settings, 
  Globe, 
  Shield, 
  Zap, 
  Image as ImageIcon,
  Users,
  CreditCard,
  FileText,
  ArrowRight,
  Sparkles,
  Heart,
  Lock
} from 'lucide-react';

const DocumentationPage: NextPage = () => {
  const { t } = useTranslation('common');

  const sections = [
    {
      id: "overview",
      title: "项目概述",
      icon: <FileText className="h-6 w-6" />,
      content: {
        description: "DreamImg AI 是一个先进的 AI 图像生成平台，为用户提供免费、强大且注重隐私的图像创作服务。",
        features: [
          "完全免费使用，无需注册",
          "多种AI模型支持（Flux.1系列、Seedream3.0）",
          "支持多种艺术风格和参数调节",
          "多语言国际化支持",
          "响应式设计，支持移动端",
          "隐私优先，图像不存储在服务器"
        ]
      }
    },
    {
      id: "architecture",
      title: "系统架构",
      icon: <Settings className="h-6 w-6" />,
      content: {
        description: "系统采用现代化的前后端分离架构，确保高性能和可扩展性。",
        components: [
          {
            name: "前端",
            tech: "Next.js 14 + TypeScript + Tailwind CSS",
            description: "响应式Web应用，支持SSR和国际化"
          },
          {
            name: "后端",
            tech: "FastAPI + Python",
            description: "高性能API服务，支持异步处理"
          },
          {
            name: "数据库",
            tech: "PostgreSQL + Prisma ORM",
            description: "可靠的数据持久化和用户管理"
          },
          {
            name: "AI服务",
            tech: "Fireworks.ai + TTAPI",
            description: "多个AI模型提供商集成"
          }
        ]
      }
    },
    {
      id: "models",
      title: "AI模型支持",
      icon: <Sparkles className="h-6 w-6" />,
      content: {
        description: "支持多种先进的AI图像生成模型，满足不同场景需求。",
        models: [
          {
            name: "Flux.1 Dev (Schnell)",
            type: "免费",
            description: "快速生成模式，适合日常创作",
            features: ["快速生成", "标准质量", "免费使用"]
          },
          {
            name: "Flux.1 Dev (Original)",
            type: "免费",
            description: "标准生成模式，平衡速度和质量",
            features: ["平衡模式", "良好质量", "免费使用"]
          },
          {
            name: "Flux.1 Pro",
            type: "付费",
            description: "专业级模型，最高质量输出",
            features: ["最高质量", "详细纹理", "需要订阅或积分"]
          },
          {
            name: "Seedream3.0",
            type: "付费",
            description: "创新模型，独特风格生成",
            features: ["独特风格", "创新算法", "需要积分"]
          }
        ]
      }
    },
    {
      id: "features",
      title: "核心功能",
      icon: <Palette className="h-6 w-6" />,
      content: {
        description: "丰富的功能集合，提供专业级的图像生成体验。",
        features: [
          {
            category: "图像生成",
            items: [
              "文本到图像生成",
              "负面提示词控制",
              "图像参考上传",
              "参考强度调节",
              "批量生成（一次4张）"
            ]
          },
          {
            category: "风格控制",
            items: [
              "17种艺术风格（动漫、数字艺术、赛博朋克等）",
              "7种色彩方案（暖色调、冷色调、柔和等）",
              "11种光照效果（戏剧性、体积光、黄金时段等）",
              "8种构图方式（特写、广角、微距等）"
            ]
          },
          {
            category: "用户体验",
            items: [
              "实时预览和下载",
              "历史记录管理",
              "灵感提示库",
              "随机提示词生成",
              "多语言界面"
            ]
          }
        ]
      }
    },
    {
      id: "security",
      title: "安全与隐私",
      icon: <Shield className="h-6 w-6" />,
      content: {
        description: "严格的安全措施和隐私保护，确保用户数据安全。",
        measures: [
          {
            name: "Cloudflare Turnstile",
            description: "防止机器人攻击和恶意请求"
          },
          {
            name: "NextAuth.js",
            description: "安全的用户认证和会话管理"
          },
          {
            name: "零数据保留",
            description: "生成的图像不存储在服务器"
          },
          {
            name: "HTTPS加密",
            description: "所有数据传输均加密"
          },
          {
            name: "CORS策略",
            description: "严格的跨域资源共享控制"
          }
        ]
      }
    },
    {
      id: "payment",
      title: "支付系统",
      icon: <CreditCard className="h-6 w-6" />,
      content: {
        description: "灵活的积分制度和订阅服务，支持多种使用模式。",
        system: [
          {
            type: "免费模式",
            description: "基础模型免费使用，需要Turnstile验证",
            benefits: ["Flux.1 Schnell", "Flux.1 Dev", "无限制使用"]
          },
          {
            type: "积分模式",
            description: "购买积分使用高级模型",
            benefits: ["所有模型访问", "按需付费", "灵活使用"]
          },
          {
            type: "Ultimate订阅",
            description: "月度订阅享受完整功能",
            benefits: ["无限制生成", "所有模型", "优先支持"]
          }
        ]
      }
    },
    {
      id: "tech-stack",
      title: "技术栈详解",
      icon: <Code className="h-6 w-6" />,
      content: {
        description: "采用现代化技术栈，确保性能和开发效率。",
        frontend: [
          "Next.js 14 - React框架，支持SSR/SSG",
          "TypeScript - 类型安全的JavaScript",
          "Tailwind CSS - 原子化CSS框架",
          "Framer Motion - 动画效果库",
          "NextAuth.js - 认证解决方案",
          "React Query - 数据获取和缓存",
          "Zustand - 轻量级状态管理",
          "next-i18next - 国际化支持"
        ],
        backend: [
          "FastAPI - 现代Python Web框架",
          "SQLAlchemy - ORM数据库工具",
          "Pydantic - 数据验证库",
          "FastAPI Users - 用户管理系统",
          "Alembic - 数据库迁移工具",
          "Uvicorn - ASGI服务器",
          "httpx - 异步HTTP客户端",
          "Pillow - 图像处理库"
        ],
        infrastructure: [
          "PostgreSQL - 主数据库",
          "Prisma - 数据库ORM（前端）",
          "Docker - 容器化部署",
          "Vercel - 前端部署平台",
          "AWS CDK - 基础设施即代码"
        ]
      }
    },
    {
      id: "api",
      title: "API文档",
      icon: <Database className="h-6 w-6" />,
      content: {
        description: "RESTful API设计，支持完整的图像生成和用户管理功能。",
        endpoints: [
          {
            method: "POST",
            path: "/api/v1/images/generate/",
            description: "生成AI图像",
            params: ["prompt", "negative_prompt", "style", "model", "turnstile_token"]
          },
          {
            method: "GET",
            path: "/api/v1/images/healthcheck/",
            description: "服务健康检查",
            params: []
          },
          {
            method: "POST",
            path: "/api/auth/register",
            description: "用户注册",
            params: ["email", "password"]
          },
          {
            method: "GET",
            path: "/api/user/credits",
            description: "获取用户积分",
            params: ["Authorization"]
          }
        ]
      }
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            DreamImg AI 网站说明文档
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            全面了解 DreamImg AI 平台的技术架构、核心功能和使用指南
          </p>
        </motion.div>

        {/* 快速导航 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                快速导航
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 border-gray-600 hover:border-amber-400 hover:bg-amber-400/10"
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    {section.icon}
                    <span className="text-sm">{section.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 主要内容区域 */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
            >
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-amber-400 flex items-center gap-3">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    {section.content.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 项目概述 */}
                  {section.id === 'overview' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">核心特性</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {section.content.features?.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-300">
                            <Heart className="h-4 w-4 text-pink-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 系统架构 */}
                  {section.id === 'architecture' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {section.content.components?.map((component, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <h4 className="text-lg font-semibold text-amber-400 mb-2">{component.name}</h4>
                          <Badge variant="outline" className="mb-3 border-blue-500 text-blue-400">
                            {component.tech}
                          </Badge>
                          <p className="text-gray-300">{component.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI模型支持 */}
                  {section.id === 'models' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {section.content.models?.map((model, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-white">{model.name}</h4>
                            <Badge variant={model.type === '免费' ? 'default' : 'secondary'}>
                              {model.type}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mb-3">{model.description}</p>
                          <div className="space-y-1">
                            {model.features.map((feature, featureIdx) => (
                              <div key={featureIdx} className="flex items-center gap-2 text-sm text-gray-400">
                                <ArrowRight className="h-3 w-3" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 核心功能 */}
                  {section.id === 'features' && (
                    <div className="space-y-6">
                      {section.content.features?.map((category, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <h4 className="text-lg font-semibold text-amber-400 mb-3">{category.category}</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {category.items.map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-2 text-gray-300">
                                <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 安全与隐私 */}
                  {section.id === 'security' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {section.content.measures?.map((measure, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-5 w-5 text-green-500" />
                            <h4 className="text-lg font-semibold text-white">{measure.name}</h4>
                          </div>
                          <p className="text-gray-300">{measure.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 支付系统 */}
                  {section.id === 'payment' && (
                    <div className="grid md:grid-cols-3 gap-6">
                      {section.content.system?.map((tier, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <h4 className="text-lg font-semibold text-amber-400 mb-2">{tier.type}</h4>
                          <p className="text-gray-300 mb-3">{tier.description}</p>
                          <div className="space-y-1">
                            {tier.benefits.map((benefit, benefitIdx) => (
                              <div key={benefitIdx} className="flex items-center gap-2 text-sm text-gray-400">
                                <ArrowRight className="h-3 w-3" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 技术栈详解 */}
                  {section.id === 'tech-stack' && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="frontend">
                        <AccordionTrigger className="text-amber-400">前端技术栈</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {section.content.frontend?.map((tech, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-300">
                                <Code className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span>{tech}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="backend">
                        <AccordionTrigger className="text-amber-400">后端技术栈</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {section.content.backend?.map((tech, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-300">
                                <Database className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{tech}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="infrastructure">
                        <AccordionTrigger className="text-amber-400">基础设施</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {section.content.infrastructure?.map((tech, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-300">
                                <Settings className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <span>{tech}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* API文档 */}
                  {section.id === 'api' && (
                    <div className="space-y-4">
                      {section.content.endpoints?.map((endpoint, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className={`
                              ${endpoint.method === 'GET' ? 'border-green-500 text-green-400' : ''}
                              ${endpoint.method === 'POST' ? 'border-blue-500 text-blue-400' : ''}
                            `}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-amber-400 font-mono">{endpoint.path}</code>
                          </div>
                          <p className="text-gray-300 mb-2">{endpoint.description}</p>
                          {endpoint.params.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {endpoint.params.map((param, paramIdx) => (
                                <Badge key={paramIdx} variant="secondary" className="text-xs">
                                  {param}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 底部信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400">开始使用 DreamImg AI</CardTitle>
              <CardDescription className="text-gray-300">
                立即体验强大的AI图像生成功能，释放您的创造力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4">
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black">
                  <a href="/">开始创作</a>
                </Button>
                <Button variant="outline" asChild className="border-amber-500 text-amber-400 hover:bg-amber-500/10">
                  <a href="/pricing">查看定价</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});

export default DocumentationPage;
