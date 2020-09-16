import type { SklepTypes } from '@sklep/types';
import Joi from 'joi';

export const addToCartPayloadSchema = Joi.object<SklepTypes['patchCartAddRequestBody']>({
  productId: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
}).required();

export const removeFromCartPayloadSchema = Joi.object<SklepTypes['patchCartRemoveRequestBody']>({
  productId: Joi.number().integer().required(),
}).required();

export const createCartResponseSchema = Joi.object<SklepTypes['postCart200Response']>({
  data: Joi.object({
    id: Joi.string().required(),
    createdAt: Joi.date().iso().required(),
    updatedAt: Joi.date().iso().required(),
    regularSubTotal: Joi.number().integer().required(),
    discountSubTotal: Joi.number().integer().required(),
    cartProducts: Joi.array()
      .items(
        Joi.object({
          quantity: Joi.number().integer().required(),
          product: Joi.object({
            id: Joi.number().integer().required(),
            name: Joi.string().required(),
            slug: Joi.string().required(),
            regularPrice: Joi.number().integer().required(),
            discountPrice: Joi.number().integer().optional().allow(null),
          }),
        }).optional(),
      )
      .required(),
  }).required(),
}).required();