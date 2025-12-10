export type Product = {
  id: number;
  video: string;
  link: string;
  description: string;
  title: string;
  productImage: string;
  price: string;
  installments: string;
};

export type Interaction = {
  type: "like" | "share" | "click";
  productId: number;
  productTitle: string;
};
