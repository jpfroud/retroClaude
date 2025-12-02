import { Request, Response } from 'express';
import { prisma } from '../index';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const {
      retrospectiveId,
      columnId,
      authorId,
      content,
      color,
      isRevealed,
    } = req.body;

    // Compter les tickets existants dans la colonne pour déterminer la position
    const ticketCount = await prisma.ticket.count({
      where: { columnId },
    });

    const ticket = await prisma.ticket.create({
      data: {
        retrospectiveId,
        columnId,
        authorId,
        content,
        color,
        isRevealed: isRevealed ?? false,
        position: ticketCount,
      },
      include: {
        author: true,
        column: true,
        comments: {
          include: {
            author: true,
          },
        },
        reactions: true,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        column: true,
        comments: {
          include: {
            author: true,
          },
        },
        reactions: true,
      },
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.ticket.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id: ticketId } = req.params;
    const { authorId, content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        ticketId,
        authorId,
        content,
      },
      include: {
        author: true,
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const addReaction = async (req: Request, res: Response) => {
  try {
    const { id: ticketId } = req.params;
    const { emoji } = req.body;

    // Vérifier si la réaction existe déjà
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        ticketId_emoji: {
          ticketId,
          emoji,
        },
      },
    });

    let reaction;
    if (existingReaction) {
      // Incrémenter le compteur
      reaction = await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { count: { increment: 1 } },
      });
    } else {
      // Créer une nouvelle réaction
      reaction = await prisma.reaction.create({
        data: {
          ticketId,
          emoji,
          count: 1,
        },
      });
    }

    res.status(201).json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { retrospectiveId, title } = req.body;

    // Compter les groupes existants pour déterminer la position
    const groupCount = await prisma.ticketGroup.count({
      where: { retrospectiveId },
    });

    const group = await prisma.ticketGroup.create({
      data: {
        retrospectiveId,
        title,
        position: groupCount,
      },
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const groupTickets = async (req: Request, res: Response) => {
  try {
    const { ticketIds, groupId } = req.body;

    // Mettre à jour tous les tickets pour les assigner au groupe
    await prisma.ticket.updateMany({
      where: {
        id: { in: ticketIds },
      },
      data: {
        groupId,
      },
    });

    // Récupérer le groupe mis à jour avec ses tickets
    const group = await prisma.ticketGroup.findUnique({
      where: { id: groupId },
      include: {
        tickets: {
          include: {
            author: true,
            comments: true,
            reactions: true,
          },
        },
      },
    });

    res.json(group);
  } catch (error) {
    console.error('Error grouping tickets:', error);
    res.status(500).json({ error: 'Failed to group tickets' });
  }
};
