import { imagePath } from "@/lib/utils";
import { Product } from "@/types/product";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Vestido Rosa con Flores",
    description: "Vestido ligero para niñas",
    price: 29.99,
    image: imagePath("/vestido_rosa.png"),
    category: "ninas",
    stock: 10,
    rating: 5
  },
  {
    id: "2",
    name: "Camiseta Oso Suave",
    description: "Algodón orgánico",
    price: 18.50,
    image: imagePath("/camiseta_oso.png"),
    category: "ninas",
    stock: 15,
    rating: 4
  },
  {
    id: "3",
    name: "Conjunto de Falda y Top",
    description: "Estampado floral",
    price: 35.00,
    image: imagePath("/conjunto_falda.png"),
    category: "ninas",
    stock: 8,
    rating: 5
  },
  {
    id: "4",
    name: "Sudadera Rosa 'LOVE'",
    description: "Acogedora y suave",
    price: 25.00,
    image: imagePath("/sudadera_love.png"),
    category: "ninas",
    stock: 20,
    rating: 4
  },
  {
    id: "5",
    name: "Chaqueta de Mezclilla",
    description: "Con parches divertidos",
    price: 42.00,
    image: imagePath("/chaqueta_denim.png"),
    category: "ninos",
    stock: 5,
    rating: 5
  },
  {
    id: "6",
    name: "Accesorios: Diademas",
    description: "Pack de 2 diademas",
    price: 12.00,
    image: imagePath("/accesorios.png"),
    category: "accesorios",
    stock: 50,
    rating: 5
  }
];
