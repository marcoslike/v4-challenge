import mongoose, { Schema, Document, Model } from 'mongoose';
import { IProduct } from '../interfaces/product'; // Interface definida corretamente na pasta de interfaces

// Define o schema para o produto
const ProductSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brands: { type: String },
  categories: { type: [String] },
  labels: { type: [String] },
  quantity: { type: String },
  ingredients_text: { type: String },
  nutriments: {
    energy_kcal_100g: { type: Number },
    fat_100g: { type: Number },
    sugars_100g: { type: Number },
    proteins_100g: { type: Number },
    salt_100g: { type: Number },
    saturated_fat_100g: { type: Number },
    energy_kj_100g: { type: Number },
    sodium_100g: { type: Number },
    fiber_100g: { type: Number },
    carbohydrates_100g: { type: Number },
  },
  countries: { type: [String] },
  image_url: { type: String },
  imported_t: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published', 'trash'], default: 'draft' },
});

// Ajustando a tipagem para que o modelo Mongoose inclua a interface IProduct
export const ProductModel: Model<IProduct & Document> = mongoose.model<IProduct & Document>('Product', ProductSchema);
