import { Request, Response } from 'express';
import { prisma } from '../index';

export const castVote = async (req: Request, res: Response) => {
  try {
    const {
      retrospectiveId,
      userId,
      ticketId,
      groupId,
    } = req.body;

    const vote = await prisma.vote.create({
      data: {
        retrospectiveId,
        userId,
        ticketId,
        groupId,
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(vote);
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};

export const getVotes = async (req: Request, res: Response) => {
  try {
    const { retrospectiveId } = req.params;

    const votes = await prisma.vote.findMany({
      where: { retrospectiveId },
      include: {
        user: true,
      },
    });

    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
};
