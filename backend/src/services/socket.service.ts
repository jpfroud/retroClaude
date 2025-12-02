import { Server, Socket } from 'socket.io';
import { prisma } from '../index';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Rejoindre une rétrospective
    socket.on('join_retro', async (data: { retroId: string; userId: string }) => {
      const { retroId, userId } = data;
      socket.join(retroId);

      // Notifier les autres participants
      socket.to(retroId).emit('user_joined', { userId, socketId: socket.id });

      console.log(`User ${userId} joined retro ${retroId}`);
    });

    // Quitter une rétrospective
    socket.on('leave_retro', async (data: { retroId: string; userId: string }) => {
      const { retroId, userId } = data;
      socket.leave(retroId);

      // Notifier les autres participants
      socket.to(retroId).emit('user_left', { userId, socketId: socket.id });

      console.log(`User ${userId} left retro ${retroId}`);
    });

    // Changer de phase
    socket.on('change_phase', async (data: { retroId: string; phase: string }) => {
      const { retroId, phase } = data;

      try {
        await prisma.retrospective.update({
          where: { id: retroId },
          data: { currentPhase: phase },
        });

        io.to(retroId).emit('phase_changed', { phase });
      } catch (error) {
        console.error('Error changing phase:', error);
      }
    });

    // Participant prêt
    socket.on('participant_ready', async (data: { retroId: string; userId: string; isReady: boolean }) => {
      const { retroId, userId, isReady } = data;

      try {
        await prisma.retroParticipant.updateMany({
          where: {
            retrospectiveId: retroId,
            userId,
          },
          data: { isReady },
        });

        io.to(retroId).emit('participant_ready_status', { userId, isReady });
      } catch (error) {
        console.error('Error updating participant ready status:', error);
      }
    });

    // Créer un ticket
    socket.on('create_ticket', async (data: any) => {
      const { retroId, ...ticketData } = data;

      try {
        const ticketCount = await prisma.ticket.count({
          where: { columnId: ticketData.columnId },
        });

        const ticket = await prisma.ticket.create({
          data: {
            ...ticketData,
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

        io.to(retroId).emit('ticket_created', ticket);
      } catch (error) {
        console.error('Error creating ticket:', error);
      }
    });

    // Mettre à jour un ticket
    socket.on('update_ticket', async (data: { retroId: string; ticketId: string; updates: any }) => {
      const { retroId, ticketId, updates } = data;

      try {
        const ticket = await prisma.ticket.update({
          where: { id: ticketId },
          data: updates,
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

        io.to(retroId).emit('ticket_updated', ticket);
      } catch (error) {
        console.error('Error updating ticket:', error);
      }
    });

    // Supprimer un ticket
    socket.on('delete_ticket', async (data: { retroId: string; ticketId: string }) => {
      const { retroId, ticketId } = data;

      try {
        await prisma.ticket.delete({
          where: { id: ticketId },
        });

        io.to(retroId).emit('ticket_deleted', { ticketId });
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    });

    // Révéler les tickets
    socket.on('reveal_tickets', async (data: { retroId: string }) => {
      const { retroId } = data;

      try {
        await prisma.ticket.updateMany({
          where: { retrospectiveId: retroId },
          data: { isRevealed: true },
        });

        io.to(retroId).emit('tickets_revealed');
      } catch (error) {
        console.error('Error revealing tickets:', error);
      }
    });

    // Ajouter un commentaire
    socket.on('create_comment', async (data: { retroId: string; ticketId: string; authorId: string; content: string }) => {
      const { retroId, ticketId, authorId, content } = data;

      try {
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

        io.to(retroId).emit('comment_created', comment);
      } catch (error) {
        console.error('Error creating comment:', error);
      }
    });

    // Ajouter une réaction
    socket.on('add_reaction', async (data: { retroId: string; ticketId: string; emoji: string }) => {
      const { retroId, ticketId, emoji } = data;

      try {
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
          reaction = await prisma.reaction.update({
            where: { id: existingReaction.id },
            data: { count: { increment: 1 } },
          });
        } else {
          reaction = await prisma.reaction.create({
            data: {
              ticketId,
              emoji,
              count: 1,
            },
          });
        }

        io.to(retroId).emit('reaction_added', reaction);
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    // Créer un groupe
    socket.on('create_group', async (data: { retroId: string; title?: string }) => {
      const { retroId, title } = data;

      try {
        const groupCount = await prisma.ticketGroup.count({
          where: { retrospectiveId: retroId },
        });

        const group = await prisma.ticketGroup.create({
          data: {
            retrospectiveId: retroId,
            title,
            position: groupCount,
          },
        });

        io.to(retroId).emit('group_created', group);
      } catch (error) {
        console.error('Error creating group:', error);
      }
    });

    // Grouper des tickets
    socket.on('group_tickets', async (data: { retroId: string; ticketIds: string[]; groupId: string }) => {
      const { retroId, ticketIds, groupId } = data;

      try {
        await prisma.ticket.updateMany({
          where: {
            id: { in: ticketIds },
          },
          data: {
            groupId,
          },
        });

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

        io.to(retroId).emit('ticket_grouped', group);
      } catch (error) {
        console.error('Error grouping tickets:', error);
      }
    });

    // Voter
    socket.on('cast_vote', async (data: { retroId: string; userId: string; ticketId?: string; groupId?: string }) => {
      const { retroId, userId, ticketId, groupId } = data;

      try {
        const vote = await prisma.vote.create({
          data: {
            retrospectiveId: retroId,
            userId,
            ticketId,
            groupId,
          },
          include: {
            user: true,
          },
        });

        io.to(retroId).emit('vote_cast', vote);
      } catch (error) {
        console.error('Error casting vote:', error);
      }
    });

    // Créer une action
    socket.on('create_action', async (data: any) => {
      const { retroId, ...actionData } = data;

      try {
        const action = await prisma.action.create({
          data: {
            ...actionData,
            retrospectiveId: retroId,
          },
          include: {
            assignedTo: true,
          },
        });

        io.to(retroId).emit('action_created', action);
      } catch (error) {
        console.error('Error creating action:', error);
      }
    });

    // Mettre à jour une action
    socket.on('update_action', async (data: { retroId: string; actionId: string; updates: any }) => {
      const { retroId, actionId, updates } = data;

      try {
        const action = await prisma.action.update({
          where: { id: actionId },
          data: updates,
          include: {
            assignedTo: true,
          },
        });

        io.to(retroId).emit('action_updated', action);
      } catch (error) {
        console.error('Error updating action:', error);
      }
    });

    // Timer
    socket.on('start_timer', async (data: { retroId: string; duration: number }) => {
      const { retroId, duration } = data;

      try {
        const existingTimer = await prisma.timer.findUnique({
          where: { retrospectiveId: retroId },
        });

        let timer;
        if (existingTimer) {
          timer = await prisma.timer.update({
            where: { id: existingTimer.id },
            data: {
              duration,
              remainingTime: duration,
              isRunning: true,
              startedAt: new Date(),
            },
          });
        } else {
          timer = await prisma.timer.create({
            data: {
              retrospectiveId: retroId,
              duration,
              remainingTime: duration,
              isRunning: true,
              startedAt: new Date(),
            },
          });
        }

        io.to(retroId).emit('timer_started', timer);

        // Démarrer le countdown
        const interval = setInterval(async () => {
          const currentTimer = await prisma.timer.findUnique({
            where: { retrospectiveId: retroId },
          });

          if (!currentTimer || !currentTimer.isRunning || currentTimer.remainingTime <= 0) {
            clearInterval(interval);
            if (currentTimer && currentTimer.remainingTime <= 0) {
              await prisma.timer.update({
                where: { id: currentTimer.id },
                data: { isRunning: false, remainingTime: 0 },
              });
              io.to(retroId).emit('timer_stopped', { finished: true });
            }
            return;
          }

          const updatedTimer = await prisma.timer.update({
            where: { id: currentTimer.id },
            data: { remainingTime: { decrement: 1 } },
          });

          io.to(retroId).emit('timer_updated', updatedTimer);
        }, 1000);
      } catch (error) {
        console.error('Error starting timer:', error);
      }
    });

    socket.on('stop_timer', async (data: { retroId: string }) => {
      const { retroId } = data;

      try {
        const timer = await prisma.timer.findUnique({
          where: { retrospectiveId: retroId },
        });

        if (timer) {
          await prisma.timer.update({
            where: { id: timer.id },
            data: { isRunning: false },
          });

          io.to(retroId).emit('timer_stopped', { finished: false });
        }
      } catch (error) {
        console.error('Error stopping timer:', error);
      }
    });

    // Icebreaker
    socket.on('submit_icebreaker', async (data: { retroId: string; userId: string; response: string }) => {
      const { retroId, userId, response } = data;

      try {
        const icebreakerResponse = await prisma.icebreakerResponse.upsert({
          where: {
            retrospectiveId_userId: {
              retrospectiveId: retroId,
              userId,
            },
          },
          update: { response },
          create: {
            retrospectiveId: retroId,
            userId,
            response,
          },
          include: {
            user: true,
          },
        });

        io.to(retroId).emit('icebreaker_response', icebreakerResponse);
      } catch (error) {
        console.error('Error submitting icebreaker:', error);
      }
    });

    // Welcome vote
    socket.on('submit_welcome_vote', async (data: { retroId: string; userId: string; rating: number }) => {
      const { retroId, userId, rating } = data;

      try {
        const welcomeVote = await prisma.welcomeVote.upsert({
          where: {
            retrospectiveId_userId: {
              retrospectiveId: retroId,
              userId,
            },
          },
          update: { rating },
          create: {
            retrospectiveId: retroId,
            userId,
            rating,
          },
          include: {
            user: true,
          },
        });

        io.to(retroId).emit('welcome_vote', welcomeVote);
      } catch (error) {
        console.error('Error submitting welcome vote:', error);
      }
    });

    // ROTI vote
    socket.on('submit_roti_vote', async (data: { retroId: string; userId: string; rating: number }) => {
      const { retroId, userId, rating } = data;

      try {
        const rotiVote = await prisma.rOTIVote.upsert({
          where: {
            retrospectiveId_userId: {
              retrospectiveId: retroId,
              userId,
            },
          },
          update: { rating },
          create: {
            retrospectiveId: retroId,
            userId,
            rating,
          },
          include: {
            user: true,
          },
        });

        io.to(retroId).emit('roti_vote', rotiVote);
      } catch (error) {
        console.error('Error submitting ROTI vote:', error);
      }
    });

    // Mettre à jour la config
    socket.on('update_config', async (data: { retroId: string; config: any }) => {
      const { retroId, config } = data;

      try {
        await prisma.retrospective.update({
          where: { id: retroId },
          data: { config },
        });

        io.to(retroId).emit('config_updated', config);
      } catch (error) {
        console.error('Error updating config:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
