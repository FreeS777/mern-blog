import { body } from 'express-validator';

export const registrValidation = [
  body('email', 'Invalid mail format').isEmail(),
  body('password', 'Minimum password length 5 charactres').isLength({ min: 5 }),
  body('login', 'Minimum user name length 3 characters').isLength({ min: 3 }),
  body('avatarUrl', 'Link to avatar is not valided').optional().isURL(),
];
