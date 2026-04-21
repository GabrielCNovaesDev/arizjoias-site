import type { Product, User, Order, Review } from '@/types';

// ── Seed Data ─────────────────────────────────────────────────────────────────

const products: Map<string, Product> = new Map([
  [
    'p1',
    {
      id: 'p1',
      name: 'Anel Solitário Cristal',
      description:
        'Delicado anel solitário com cristal central lapidado, banhado em ouro 18k. Perfeito para ocasiões especiais ou para usar no dia a dia com sofisticação.',
      price: 189.9,
      category: 'aneis',
      material: 'banhado-ouro',
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
        'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&q=80',
      ],
      stock: 15,
      featured: true,
      sizes: ['14', '15', '16', '17', '18'],
      tags: ['solitário', 'cristal', 'presente'],
      createdAt: new Date('2025-01-01'),
    },
  ],
  [
    'p2',
    {
      id: 'p2',
      name: 'Anel Aparador Delicado',
      description:
        'Anel aparador com design minimalista e filigrana em prata 925. Combina perfeitamente com anéis de noivado ou como peça única.',
      price: 149.9,
      category: 'aneis',
      material: 'prata',
      images: [
        'https://images.unsplash.com/photo-1599458252573-56ae36120de1?w=800&q=80',
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      ],
      stock: 20,
      featured: false,
      sizes: ['14', '15', '16', '17', '18', '19'],
      tags: ['aparador', 'minimalista'],
      createdAt: new Date('2025-01-10'),
    },
  ],
  [
    'p3',
    {
      id: 'p3',
      name: 'Aliança Eternidade',
      description:
        'Aliança cravejada com zircônias ao redor de todo o aro, criando um efeito de eternidade. Disponível em ouro rosé ou dourado.',
      price: 289.9,
      originalPrice: 349.9,
      category: 'aneis',
      material: 'banhado-rosegold',
      images: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
      ],
      stock: 8,
      featured: true,
      sizes: ['14', '15', '16', '17', '18'],
      tags: ['aliança', 'eternidade', 'zircônia'],
      createdAt: new Date('2025-01-15'),
    },
  ],
  [
    'p4',
    {
      id: 'p4',
      name: 'Colar Gargantilha Floral',
      description:
        'Gargantilha com pingente floral delicado cravejado com cristais. Comprimento ajustável entre 38cm e 42cm. Banhada em ouro 18k.',
      price: 219.9,
      category: 'colares',
      material: 'banhado-ouro',
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      ],
      stock: 12,
      featured: true,
      tags: ['gargantilha', 'floral', 'cristal'],
      createdAt: new Date('2025-01-20'),
    },
  ],
  [
    'p5',
    {
      id: 'p5',
      name: 'Colar Choker Veneziana',
      description:
        'Choker de corrente veneziana em prata 925 com pingente de pérola cultivada. Elegante e versátil, transita do casual ao formal.',
      price: 179.9,
      category: 'colares',
      material: 'prata',
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
        'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=800&q=80',
      ],
      stock: 18,
      featured: false,
      tags: ['choker', 'pérola', 'veneziana'],
      createdAt: new Date('2025-02-01'),
    },
  ],
  [
    'p6',
    {
      id: 'p6',
      name: 'Colar Longo Multi-pérolas',
      description:
        'Colar longo com fio de pérolas de vidro facetado em tons rosé e transparente. Pode ser usado em camadas ou com nó para diferentes comprimentos.',
      price: 259.9,
      originalPrice: 319.9,
      category: 'colares',
      material: 'banhado-rosegold',
      images: [
        'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
      ],
      stock: 10,
      featured: true,
      tags: ['longo', 'pérolas', 'camadas'],
      createdAt: new Date('2025-02-10'),
    },
  ],
  [
    'p7',
    {
      id: 'p7',
      name: 'Brinco Argola Slim',
      description:
        'Argolas finas e elegantes em ouro 18k. Design atemporal que valoriza qualquer rosto. Perfeitas para usar todos os dias.',
      price: 139.9,
      category: 'brincos',
      material: 'banhado-ouro',
      images: [
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&q=80',
        'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80',
      ],
      stock: 25,
      featured: true,
      tags: ['argola', 'slim', 'dia a dia'],
      createdAt: new Date('2025-02-15'),
    },
  ],
  [
    'p8',
    {
      id: 'p8',
      name: 'Brinco Ponto de Luz Flor',
      description:
        'Brinco ponto de luz em formato de flor com cristais pavê. Discreto e sofisticado, ideal para looks formais ou casuais elegantes.',
      price: 119.9,
      category: 'brincos',
      material: 'prata',
      images: [
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
        'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=800&q=80',
      ],
      stock: 30,
      featured: false,
      tags: ['ponto de luz', 'flor', 'pavê'],
      createdAt: new Date('2025-03-01'),
    },
  ],
  [
    'p9',
    {
      id: 'p9',
      name: 'Ear Cuff Folha',
      description:
        'Ear cuff sem furo com design de folha em prata banhada. Moderno e minimalista, não precisa de furo na orelha. Feito para quem ama tendências.',
      price: 99.9,
      category: 'brincos',
      material: 'banhado-rosegold',
      images: [
        'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&q=80',
        'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=800&q=80',
      ],
      stock: 22,
      featured: false,
      tags: ['ear cuff', 'folha', 'sem furo'],
      createdAt: new Date('2025-03-10'),
    },
  ],
  [
    'p10',
    {
      id: 'p10',
      name: 'Pulseira Riviera Zircônia',
      description:
        'Pulseira riviera cravejada com zircônias em degradê de cores. Fecho de lagosta banhado em ouro. Deslumbrante e sofisticada.',
      price: 319.9,
      originalPrice: 389.9,
      category: 'pulseiras',
      material: 'banhado-ouro',
      images: [
        'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
        'https://images.unsplash.com/photo-1620656798579-1984d9e87df7?w=800&q=80',
      ],
      stock: 7,
      featured: true,
      tags: ['riviera', 'zircônia', 'degradê'],
      createdAt: new Date('2025-03-15'),
    },
  ],
  [
    'p11',
    {
      id: 'p11',
      name: 'Pulseira Elo Português',
      description:
        'Pulseira com elo português em prata 925. Clássica e elegante, com fecho de lagosta e extensão ajustável. Garantia vitalícia contra manchas.',
      price: 199.9,
      category: 'pulseiras',
      material: 'prata',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?w=800&q=80',
      ],
      stock: 16,
      featured: false,
      tags: ['elo português', 'clássica'],
      createdAt: new Date('2025-03-20'),
    },
  ],
  [
    'p12',
    {
      id: 'p12',
      name: 'Set Completo Botânico',
      description:
        'Kit completo com anel, colar e brincos com tema botânico — folhas e flores em relevo banhadas em ouro rosé. Embalagem presenteável inclusa.',
      price: 489.9,
      originalPrice: 599.9,
      category: 'sets',
      material: 'banhado-rosegold',
      images: [
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&q=80',
        'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=800&q=80',
      ],
      stock: 5,
      featured: true,
      tags: ['set', 'botânico', 'presente', 'completo'],
      createdAt: new Date('2025-04-01'),
    },
  ],
]);

const users: Map<string, User> = new Map();
const orders: Map<string, Order> = new Map();
const reviews: Map<string, Review> = new Map([
  [
    'r1',
    {
      id: 'r1',
      userId: 'u_demo',
      userName: 'Mariana S.',
      rating: 5,
      comment:
        'Recebi meu colar e fiquei apaixonada! A qualidade é incrível, muito melhor do que esperava. A embalagem chegou lindíssima. Com certeza vou comprar mais!',
      createdAt: new Date('2025-03-01'),
    },
  ],
  [
    'r2',
    {
      id: 'r2',
      userId: 'u_demo2',
      userName: 'Fernanda L.',
      rating: 5,
      comment:
        'Comprei o set botânico de presente para minha mãe e ela amou! As peças são delicadas e sofisticadas. O atendimento foi excelente e a entrega super rápida.',
      createdAt: new Date('2025-03-15'),
    },
  ],
  [
    'r3',
    {
      id: 'r3',
      userId: 'u_demo3',
      userName: 'Juliana R.',
      rating: 5,
      comment:
        'A pulseira riviera é ainda mais linda pessoalmente. As zircônias brilham muito! Já recebi vários elogios. Marca impecável, vou recomendar para todas as amigas.',
      createdAt: new Date('2025-04-01'),
    },
  ],
]);

// ── Repository Layer ───────────────────────────────────────────────────────────

export const productRepository = {
  findAll(): Product[] {
    return Array.from(products.values());
  },

  findById(id: string): Product | undefined {
    return products.get(id);
  },

  findFeatured(): Product[] {
    return Array.from(products.values()).filter((p) => p.featured);
  },

  findByCategory(category: string): Product[] {
    return Array.from(products.values()).filter((p) => p.category === category);
  },

  filter(filters: {
    category?: string;
    material?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
  }): Product[] {
    return Array.from(products.values()).filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.material && p.material !== filters.material) return false;
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.featured !== undefined && p.featured !== filters.featured) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  },

  create(product: Product): Product {
    products.set(product.id, product);
    return product;
  },
};

export const userRepository = {
  findById(id: string): User | undefined {
    return users.get(id);
  },

  findByEmail(email: string): User | undefined {
    return Array.from(users.values()).find((u) => u.email === email);
  },

  create(user: User): User {
    users.set(user.id, user);
    return user;
  },

  update(id: string, data: Partial<User>): User | undefined {
    const user = users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    users.set(id, updated);
    return updated;
  },
};

export const orderRepository = {
  findById(id: string): Order | undefined {
    return orders.get(id);
  },

  findByUserId(userId: string): Order[] {
    return Array.from(orders.values()).filter((o) => o.userId === userId);
  },

  create(order: Order): Order {
    orders.set(order.id, order);
    return order;
  },

  update(id: string, data: Partial<Order>): Order | undefined {
    const order = orders.get(id);
    if (!order) return undefined;
    const updated = { ...order, ...data };
    orders.set(id, updated);
    return updated;
  },
};

export const reviewRepository = {
  findAll(): Review[] {
    return Array.from(reviews.values());
  },

  findByProductId(productId: string): Review[] {
    return Array.from(reviews.values()).filter((r) => r.productId === productId);
  },
};
