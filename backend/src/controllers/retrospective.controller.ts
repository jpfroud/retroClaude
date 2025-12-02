import { Request, Response } from 'express';
import { prisma } from '../index';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

const RETRO_TEMPLATES = {
  classic: [
    { title: 'Ce qui s\'est bien passé 😊', color: '#10b981', position: 0 },
    { title: 'Ce qui s\'est moins bien passé 😟', color: '#ef4444', position: 1 },
    { title: 'Idées d\'amélioration 💡', color: '#3b82f6', position: 2 },
  ],
  '4l': [
    { title: 'Learned (Appris) 📚', color: '#8b5cf6', position: 0 },
    { title: 'Liked (Aimé) ❤️', color: '#ec4899', position: 1 },
    { title: 'Lacked (Manqué) 🔍', color: '#f59e0b', position: 2 },
    { title: 'Longed for (Désiré) 🌟', color: '#06b6d4', position: 3 },
  ],
  'start-stop-continue': [
    { title: 'Start (Commencer) 🚀', color: '#10b981', position: 0 },
    { title: 'Stop (Arrêter) 🛑', color: '#ef4444', position: 1 },
    { title: 'Continue (Continuer) ➡️', color: '#3b82f6', position: 2 },
  ],
};

export const createRetrospective = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      template,
      isAnonymous,
      createdById,
      columns,
      config,
    } = req.body;

    // Générer un code d'invitation unique
    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    // Générer le QR code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const joinUrl = `${frontendUrl}/join/${inviteCode}`;
    const qrCode = await QRCode.toDataURL(joinUrl);

    // Déterminer les colonnes à créer
    let columnsToCreate = columns;
    if (!columns && template !== 'custom' && RETRO_TEMPLATES[template as keyof typeof RETRO_TEMPLATES]) {
      columnsToCreate = RETRO_TEMPLATES[template as keyof typeof RETRO_TEMPLATES];
    }

    // Créer la rétrospective
    const retrospective = await prisma.retrospective.create({
      data: {
        title,
        description,
        template,
        isAnonymous: isAnonymous || false,
        inviteCode,
        qrCode,
        createdById,
        config: config || {},
        columns: {
          create: columnsToCreate || [],
        },
        participants: {
          create: {
            userId: createdById,
            role: 'facilitator',
          },
        },
      },
      include: {
        columns: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json(retrospective);
  } catch (error) {
    console.error('Error creating retrospective:', error);
    res.status(500).json({ error: 'Failed to create retrospective' });
  }
};

export const getRetrospective = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const retrospective = await prisma.retrospective.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
        participants: {
          include: {
            user: true,
          },
        },
        tickets: {
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
          orderBy: { position: 'asc' },
        },
        ticketGroups: {
          include: {
            tickets: {
              include: {
                author: true,
                comments: true,
                reactions: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        votes: {
          include: {
            user: true,
          },
        },
        actions: {
          include: {
            assignedTo: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        actionItems: {
          orderBy: { createdAt: 'desc' },
        },
        icebreakers: {
          include: {
            user: true,
          },
        },
        welcomeVotes: {
          include: {
            user: true,
          },
        },
        rotiVotes: {
          include: {
            user: true,
          },
        },
        timer: true,
      },
    });

    if (!retrospective) {
      return res.status(404).json({ error: 'Retrospective not found' });
    }

    res.json(retrospective);
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    res.status(500).json({ error: 'Failed to fetch retrospective' });
  }
};

export const getRetrospectiveByInviteCode = async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.params;

    const retrospective = await prisma.retrospective.findUnique({
      where: { inviteCode },
      include: {
        columns: true,
      },
    });

    if (!retrospective) {
      return res.status(404).json({ error: 'Retrospective not found' });
    }

    res.json(retrospective);
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    res.status(500).json({ error: 'Failed to fetch retrospective' });
  }
};

export const joinRetrospective = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Vérifier si l'utilisateur est déjà participant
    const existingParticipant = await prisma.retroParticipant.findUnique({
      where: {
        retrospectiveId_userId: {
          retrospectiveId: id,
          userId,
        },
      },
    });

    if (existingParticipant) {
      return res.json(existingParticipant);
    }

    // Ajouter le participant
    const participant = await prisma.retroParticipant.create({
      data: {
        retrospectiveId: id,
        userId,
        role: 'participant',
      },
      include: {
        user: true,
      },
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error joining retrospective:', error);
    res.status(500).json({ error: 'Failed to join retrospective' });
  }
};

export const updatePhase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { phase } = req.body;

    const retrospective = await prisma.retrospective.update({
      where: { id },
      data: { currentPhase: phase },
    });

    res.json(retrospective);
  } catch (error) {
    console.error('Error updating phase:', error);
    res.status(500).json({ error: 'Failed to update phase' });
  }
};

export const updateConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { config } = req.body;

    const retrospective = await prisma.retrospective.update({
      where: { id },
      data: { config },
    });

    res.json(retrospective);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update config' });
  }
};
