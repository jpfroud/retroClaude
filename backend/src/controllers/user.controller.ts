import { Request, Response } from 'express';
import { prisma } from '../index';

// Couleurs prédéfinies pour les utilisateurs
const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // Assigner une couleur aléatoire
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        color,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
