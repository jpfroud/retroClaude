import { Request, Response } from 'express';
import { prisma } from '../index';

export const createAction = async (req: Request, res: Response) => {
  try {
    const {
      retrospectiveId,
      ticketId,
      title,
      description,
      assignedToId,
      status,
    } = req.body;

    const action = await prisma.action.create({
      data: {
        retrospectiveId,
        ticketId,
        title,
        description,
        assignedToId,
        status: status || 'proposed',
      },
      include: {
        assignedTo: true,
      },
    });

    res.status(201).json(action);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
};

export const updateAction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const action = await prisma.action.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: true,
      },
    });

    res.json(action);
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
};

export const getActions = async (req: Request, res: Response) => {
  try {
    const { retrospectiveId } = req.params;

    const actions = await prisma.action.findMany({
      where: { retrospectiveId },
      include: {
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(actions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
};

export const createActionItem = async (req: Request, res: Response) => {
  try {
    const {
      retrospectiveId,
      title,
      description,
      assignedTo,
      fromRetroId,
    } = req.body;

    const actionItem = await prisma.actionItem.create({
      data: {
        retrospectiveId,
        title,
        description,
        assignedTo,
        fromRetroId,
      },
    });

    res.status(201).json(actionItem);
  } catch (error) {
    console.error('Error creating action item:', error);
    res.status(500).json({ error: 'Failed to create action item' });
  }
};

export const updateActionItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const actionItem = await prisma.actionItem.update({
      where: { id },
      data: updateData,
    });

    res.json(actionItem);
  } catch (error) {
    console.error('Error updating action item:', error);
    res.status(500).json({ error: 'Failed to update action item' });
  }
};
