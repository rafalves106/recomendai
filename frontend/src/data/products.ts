import type { Category, Product } from "../types";

export const CATEGORIES: Category[] = [
  {
    id: "electronics",
    name: "Eletrônicos",
    slug: "eletronicos",
    icon: "Cpu",
    productCount: 6,
  },
  {
    id: "fashion",
    name: "Moda",
    slug: "moda",
    icon: "Shirt",
    productCount: 6,
  },
  {
    id: "home",
    name: "Casa & Decoração",
    slug: "casa",
    icon: "Home",
    productCount: 6,
  },
  {
    id: "sports",
    name: "Esportes",
    slug: "esportes",
    icon: "Dumbbell",
    productCount: 6,
  },
  {
    id: "books",
    name: "Livros",
    slug: "livros",
    icon: "BookOpen",
    productCount: 6,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "electronics-1",
    name: "Notebook Quantum Pro 14",
    description:
      "Notebook leve para estudos, trabalho remoto e criação de conteúdo com desempenho consistente.",
    price: 4299.0,
    originalPrice: 4899.0,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&q=80",
    tags: ["notebook", "trabalho remoto", "performance", "produtividade"],
    rating: 4.8,
    reviewCount: 621,
    inStock: true,
  },
  {
    id: "electronics-2",
    name: "Fone Pulse ANC",
    description:
      "Fone sem fio com cancelamento de ruído e bateria para o dia inteiro.",
    price: 899.9,
    originalPrice: 1099.9,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80",
    tags: ["fone", "bluetooth", "anc", "música", "trabalho"],
    rating: 4.7,
    reviewCount: 487,
    inStock: true,
  },
  {
    id: "electronics-3",
    name: "Smartphone Aurora S24",
    description:
      "Smartphone premium com câmeras versáteis, tela brilhante e carregamento rápido.",
    price: 2499.0,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80",
    tags: ["smartphone", "câmera", "android", "5g"],
    rating: 4.9,
    reviewCount: 843,
    inStock: true,
  },
  {
    id: "electronics-4",
    name: "Tablet Neo Note 11",
    description:
      "Tablet para leitura, videoaulas e desenho digital com bateria prolongada.",
    price: 1599.9,
    originalPrice: 1799.9,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&q=80",
    tags: ["tablet", "estudo", "desenho", "multitarefa"],
    rating: 4.6,
    reviewCount: 214,
    inStock: true,
  },
  {
    id: "electronics-5",
    name: "Smartwatch Pulse Fit Max",
    description:
      "Relógio inteligente para monitorar saúde, treinos e notificações do dia a dia.",
    price: 799.9,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&q=80",
    tags: ["smartwatch", "saúde", "fitness", "notificações"],
    rating: 4.8,
    reviewCount: 532,
    inStock: true,
  },
  {
    id: "electronics-6",
    name: "Câmera Snap Focus 4K",
    description:
      "Câmera compacta para criadores que querem imagens nítidas em qualquer ambiente.",
    price: 2199.0,
    originalPrice: 2399.0,
    category: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop&q=80",
    tags: ["camera", "4k", "criador de conteúdo", "foto"],
    rating: 4.5,
    reviewCount: 198,
    inStock: true,
  },
  {
    id: "fashion-1",
    name: "Vestido Fluido Aurora",
    description:
      "Vestido leve com caimento elegante para ocasiões casuais e eventos especiais.",
    price: 249.9,
    originalPrice: 329.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop&q=80",
    tags: ["vestido", "moda feminina", "elegante", "verão"],
    rating: 4.7,
    reviewCount: 311,
    inStock: true,
  },
  {
    id: "fashion-2",
    name: "Tênis Street Flex",
    description:
      "Tênis urbano confortável para rotina intensa, passeios e looks versáteis.",
    price: 399.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80",
    tags: ["tênis", "streetwear", "conforto", "casual"],
    rating: 4.8,
    reviewCount: 447,
    inStock: true,
  },
  {
    id: "fashion-3",
    name: "Jaqueta Urban Canvas",
    description:
      "Jaqueta estruturada que combina proteção leve com visual moderno.",
    price: 459.9,
    originalPrice: 539.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=400&h=400&fit=crop&q=80",
    tags: ["jaqueta", "outono", "casual", "camadas"],
    rating: 4.6,
    reviewCount: 169,
    inStock: true,
  },
  {
    id: "fashion-4",
    name: "Bolsa City Tote",
    description:
      "Bolsa espaçosa para levar itens essenciais com organização e estilo.",
    price: 289.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=80",
    tags: ["bolsa", "trabalho", "organização", "acessórios"],
    rating: 4.4,
    reviewCount: 205,
    inStock: true,
  },
  {
    id: "fashion-5",
    name: "Óculos Solar Mirage",
    description:
      "Óculos escuros com design leve e proteção para dias de sol intenso.",
    price: 179.9,
    originalPrice: 229.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&q=80",
    tags: ["óculos", "proteção solar", "acessórios", "estilo"],
    rating: 4.7,
    reviewCount: 278,
    inStock: true,
  },
  {
    id: "fashion-6",
    name: "Chapéu Fedora Breeze",
    description:
      "Chapéu clássico para composições elegantes e produção de moda.",
    price: 129.9,
    category: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop&q=80",
    tags: ["chapéu", "acessório", "verão", "elegante"],
    rating: 4.2,
    reviewCount: 84,
    inStock: true,
  },
  {
    id: "home-1",
    name: "Luminária Aurora Hue",
    description:
      "Luminária de mesa com luz suave para criar ambientes aconchegantes.",
    price: 219.9,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&q=80",
    tags: ["luminária", "decoração", "iluminação", "ambiente"],
    rating: 4.7,
    reviewCount: 197,
    inStock: true,
  },
  {
    id: "home-2",
    name: "Sofá Modular Nuvem",
    description:
      "Sofá modular amplo com visual contemporâneo para salas acolhedoras.",
    price: 2499.0,
    originalPrice: 2799.0,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop&q=80",
    tags: ["sofá", "sala", "modular", "conforto"],
    rating: 4.9,
    reviewCount: 512,
    inStock: true,
  },
  {
    id: "home-3",
    name: "Planta Ficus Decor",
    description:
      "Planta decorativa artificial para dar vida a qualquer canto da casa.",
    price: 89.9,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop&q=80",
    tags: ["planta", "decoração", "verde", "minimalista"],
    rating: 4.3,
    reviewCount: 143,
    inStock: true,
  },
  {
    id: "home-4",
    name: "Quadro Minimal Line",
    description:
      "Quadro com arte abstrata para compor paredes com leveza e personalidade.",
    price: 149.9,
    originalPrice: 189.9,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop&q=80",
    tags: ["quadro", "arte", "parede", "design"],
    rating: 4.6,
    reviewCount: 96,
    inStock: true,
  },
  {
    id: "home-5",
    name: "Vela Aromática Calm",
    description:
      "Vela perfumada para momentos de descanso, leitura e banho relaxante.",
    price: 59.9,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop&q=80",
    tags: ["vela", "aromaterapia", "relaxamento", "casa"],
    rating: 4.5,
    reviewCount: 223,
    inStock: true,
  },
  {
    id: "home-6",
    name: "Tapete Soft Grid",
    description:
      "Tapete macio com toque moderno para salas, quartos e home office.",
    price: 189.9,
    originalPrice: 229.9,
    category: "home",
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop&q=80",
    tags: ["tapete", "conforto", "sala", "textura"],
    rating: 4.4,
    reviewCount: 132,
    inStock: true,
  },
  {
    id: "sports-1",
    name: "Tapete Yoga Balance",
    description:
      "Tapete antiderrapante para yoga, alongamento e treinos leves em casa.",
    price: 99.9,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop&q=80",
    tags: ["yoga", "alongamento", "antiderrapante", "fitness"],
    rating: 4.8,
    reviewCount: 401,
    inStock: true,
  },
  {
    id: "sports-2",
    name: "Tênis Running Peak",
    description:
      "Tênis de corrida com amortecimento responsivo e alta respirabilidade.",
    price: 549.9,
    originalPrice: 649.9,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80",
    tags: ["corrida", "amortecimento", "leve", "performance"],
    rating: 4.9,
    reviewCount: 623,
    inStock: true,
  },
  {
    id: "sports-3",
    name: "Bicicleta Urban Ride",
    description:
      "Bicicleta versátil para mobilidade urbana e lazer aos finais de semana.",
    price: 1899.0,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop&q=80",
    tags: ["bicicleta", "mobilidade", "lazer", "urbano"],
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
  },
  {
    id: "sports-4",
    name: "Kit Gym Power",
    description:
      "Kit funcional para musculação em casa com acessórios práticos e duráveis.",
    price: 329.9,
    originalPrice: 399.9,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop&q=80",
    tags: ["academia", "força", "treino em casa", "kit"],
    rating: 4.7,
    reviewCount: 288,
    inStock: true,
  },
  {
    id: "sports-5",
    name: "Raquete Smash Pro",
    description:
      "Raquete de tênis para treinos consistentes e jogos com mais controle.",
    price: 689.9,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1554061403-c0fba46a1d4d?w=400&h=400&fit=crop&q=80",
    tags: ["tênis", "raquete", "controle", "esporte"],
    rating: 4.5,
    reviewCount: 74,
    inStock: false,
  },
  {
    id: "sports-6",
    name: "Óculos Natação Flow",
    description:
      "Óculos de natação confortáveis para treinos longos e lazer na piscina.",
    price: 89.9,
    category: "sports",
    imageUrl:
      "https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=400&fit=crop&q=80",
    tags: ["natação", "piscina", "treino", "acessório"],
    rating: 4.2,
    reviewCount: 121,
    inStock: true,
  },
  {
    id: "books-1",
    name: "Box Clássicos Essenciais",
    description:
      "Coleção com títulos indispensáveis para quem ama literatura e boas histórias.",
    price: 219.9,
    originalPrice: 269.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=400&fit=crop&q=80",
    tags: ["literatura", "clássicos", "coleção", "presente"],
    rating: 4.8,
    reviewCount: 347,
    inStock: true,
  },
  {
    id: "books-2",
    name: "Livro Hábitos que Constroem",
    description:
      "Obra prática sobre rotina, foco e pequenas mudanças com grande impacto.",
    price: 49.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop&q=80",
    tags: ["desenvolvimento pessoal", "produtividade", "hábitos"],
    rating: 4.6,
    reviewCount: 182,
    inStock: true,
  },
  {
    id: "books-3",
    name: "Caderno de Estudos Inteligentes",
    description:
      "Caderno com organização simples para revisar conteúdos e anotar ideias.",
    price: 34.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop&q=80",
    tags: ["estudo", "anotações", "caderno", "organização"],
    rating: 4.4,
    reviewCount: 97,
    inStock: true,
  },
  {
    id: "books-4",
    name: "Romance Na Estação Central",
    description:
      "Romance contemporâneo com leitura leve para acompanhar pausas e viagens.",
    price: 29.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&h=400&fit=crop&q=80",
    tags: ["romance", "leitura leve", "ficção", "viagem"],
    rating: 3.8,
    reviewCount: 64,
    inStock: false,
  },
  {
    id: "books-5",
    name: "Manual do Leitor Noturno",
    description:
      "Livro para quem gosta de rotina de leitura com reflexões curtas e diretas.",
    price: 64.9,
    originalPrice: 84.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&q=80",
    tags: ["leitura", "reflexão", "noite", "livros"],
    rating: 4.5,
    reviewCount: 12,
    inStock: true,
  },
  {
    id: "books-6",
    name: "Guia de Escrita Criativa",
    description:
      "Guia prático para desenvolver histórias, personagens e projetos autorais.",
    price: 79.9,
    category: "books",
    imageUrl:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=400&fit=crop&q=80",
    tags: ["escrita", "criatividade", "roteiro", "autoria"],
    rating: 4.7,
    reviewCount: 146,
    inStock: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return PRODUCTS.filter((product) => product.category === categoryId);
}
